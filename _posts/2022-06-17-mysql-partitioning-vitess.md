---
layout: post
title: MySQL Partitioning & Vitess
date: 2022-06-17T02:39:12.161Z
modified: 2022-06-17T02:39:12.172Z
image: /assets/img/upload/vitess-horizontal.png
tag:
  - Tech
  - Database
description: Các DB trong quá trình vận hành thì có thể xảy ra tình trạng data
  phình lên ở một/một số tables, lúc này việc xử lý query ở các tables này không
  còn hiệu quả và thậm chí là gây quá tải DB. Lúc này thì chia nhỏ data ở các
  tables này ra nhiều phần là giải pháp hiệu quả nhất.
keywords:
  - Tech
  - Database
  - Distributed database
  - MySQL
---
### Calendar

1. Intro.
2. MySQL partitioning.
3. Vitess.
   1. Giới thiệu sơ lược về Vitess.
   2. Architecture của Vitess.
   3. Các components chính của Vitess.
      1. VTGate.
      2. VTTablet.
      3. Topology service.
      4. Cell.
      5. VReplication
      6. Other components (cli, admin gui,...).
   4. Execution Plans.
   5. Re-sharding.
   6. VReplication.
   7. Secondary Vindex.
   8. Các limit của Vitess.
      1. Cross-shard transactions.
      2. Cross-shard joins.
      3. Unsupported cases.
   9. Conclusion.

### 1. Intro



> Đây là bài present của mình tại [Grokking Vietnam - Database Lab](https://www.grokking.org/).



Các DB trong quá trình vận hành thì có thể xảy ra tình trạng data phình lên ở một/một số tables, lúc này việc xử lý query ở các tables này không còn hiệu quả và thậm chí là gây quá tải DB.

Lúc này thì chia nhỏ data ở các tables này ra nhiều phần là giải pháp hiệu quả nhất, bài present này sẽ giới thiệu 2 giải pháp tương ứng đối với system nhỏ và lớn đó là **MySQL partitioning** và **Sharding bằng Vitess**.

- - -

### 2. MySQL partitioning

Kể từ version 5.6 thì partitioning được support bởi MySQL cho các storage engines là InnoDB và NDB.

![MySQL partitioning](/assets/img/upload/mysql-partitioning.jpeg "MySQL partitioning")

Partitioning chia nhỏ data thành các subset (partitioned tables) và lưu ở các directory khác nhau trên **cùng một file system**.
Việc chia nhỏ data thành các subset nhỏ giúp cho việc query trên các large dataset hiệu quả hơn vì các câu query chỉ chạy trên các subset chứa data cần thiết.

Cơ chế hoạt động của partitioning có nhiều điểm tương đồng với sharding tuy nhiên đơn giản hơn vì chỉ hoạt động trên cùng machine và được support native bởi MySQL.

MySQL sẽ chia data trên các partitioned table ra thành các subset dựa vào partitioning stategy do user chọn, các partitioning stategies được support bao gồm: RANGE, LIST, HASH, KEY.

**Pros**:

* Đơn giản, chi phí triển khai thấp đối với các hệ thống đang hoạt động.
* Dễ quản lý.
* Không ảnh hưởng đến tầng Application.
* Support native bởi MySQL.

**Cons**:

* Data vẫn nằm trên cùng 1 machine, cho nên khi data quá lớn thì vẫn không handle nổi.

\=> Partitioning sẽ phù hợp với các hệ thống không quá lớn và cần optimize cho các large datasets (> 1 mil records) trong hệ thống để cải thiện query performance.

**Reference**:

* https://dev.mysql.com/doc/mysql-partitioning-excerpt/8.0/en/partitioning.html

- - -

### 3. Vitess

#### 3.1 Giới thiệu sơ lược về Vitess

Vitess là một open-source hỗ trợ deploying, scaling và managing cho các MySQL clusters được phát triển bởi team YouTube.

Là một layer trung gian giữa tầng application và các MySQL clusters, bao gồm các features về sharding, shard management, queries rewrites, connection pooling,...

**History**:

Vitess được tạo ra vào năm 2010 để giải quyết các scalability challenges đối với MySQL mà team YouTube gặp phải, dưới dây là các sự kiện đã diễn ra và dẫn đến sự ra đời của Vitess:

* MySQL DB của YouTube đạt đến ngưỡng khi lượng traffic truy cập vào cao điểm sắp vượt quá serving capacity của DB. Để tạm thời khắc phục sự cố, YouTube đã chia ra các node master và slave để chia tải read và write.
* Read-only traffic vẫn rất cao và sớm vượt quá serving capacity của các replica DB, do đó YouTube tiếp tục tạo thêm nhiều replicas, đây vẫn chỉ là giải pháp tạm thời.
* Write traffic trở nên quá cao đối với master DB, bắt buộc YouTube phải shard data để có thể handle incoming traffic. Ngoài ra, sharding là bắt buộc khi mà size của databse trở nên quá lớn để lưu trên 1 MySQL instance.
* Tầng Application của YouTube đã phải chỉnh sửa để có thể tìm và định danh các shard tương ứng trước khi gửi câu query đi.

\=> Vitess ra đời, lúc này vẫn là internal tool của YouTube.
=> Vitess giúp cho YouTube loại bỏ phần logic ở tầng application, tạo ra một proxy giữa tầng application và database clusters. Kể từ đây, User base của YouTube đã scale lên gấp ~50 lần, tăng đáng kể khá năng serve pages, xử lý videos,...

Commit public đầu tiên của Vitess lên github là vào  24/02/2012.

#### 3.2 Architecture của Vitess

![Vitess architecture](/assets/img/upload/screen-shot-2019-12-23-at-6.08.29-pm-1.png "Vitess architecture")

**Scalability philosophy:**

* **Small instances**: Vitess recommend chia nhỏ thành các DB instance dưới 250GB, giúp cho việc quản lý các instance trở nên dễ dàng và hiệu quả hơn. (Ít deadlock, dễ replicate,...)
* **Durability through replication**: Vitess hỗ trợ replicate theo mô hình master-slave cho các shards by default, và có hỗ trợ failover khi primary instance gặp sự cố.
* **Consistency model**: 
  		- Single-shard transactions vẫn sẽ đảm bảo tính ACID. => nên chọn sharding key tối ưu nhất để các transaction được thực hiện trên cùng một shard.
  		- Cross-shard transactions không được hỗ trợ by default và sẽ không đảm bảo tính ACID, có thể bật 2PC (two phase commit) để đạt được atomic tuy nhiên cost cho write query sẽ tăng (~50%).
  		- Các mức độ consistency của query sẽ tùy thuộc vào level được chọn:
  			- `REPLICA/RDONLY read`: Query có thể được thực hiện ở bất cứ nodes nào, nhưng data có thể không consistency (replica lag).
  			- `PRIMARY read`: Query chỉ được thực hiện ở node primary, đảm bảo data luôn là up-to-date (read-after-write consistency).
  			- `PRIMARY transaction`: gần giống với PRIMARY read, nhưng đạt được isolation level là REPEATABLE_READ.
* **No active-active replication**: không hỗ trợ multi-master, chỉ hỗ trợ master-slaves.
* **Multi-cell**: Vitess được design để hoạt động trên nhiều `data centers / regions / cells`. "Cell" là một danh sách các servers nằm gần với nhau (ideal là trên cùng region).

### 3.3 Các components chính của Vitess

**VTGate**:

Là một lightweight proxy server giúp route các câu queries đến đúng VTTablet, tổng hợp  và trả về kết quả sau cùng cho client.
VTGate cũng là nơi tạo ra execution plans từ câu SQL raw nhận được.

**VTTablet**:

Mỗi Tablet sẽ tương ứng với một MySQL instance và thông thường sẽ nằm trên cùng server.
Tablet sẽ nhận các câu query (đã được phân tách) từ VTGate và pass xuống cho MySQL instance thực thi.

Các Tablets sẽ có các vai trò khác nhau tùy thuộc vào `tablet type`, các tablet type bao gồm:

* `primary`:  Là tablet chính đối với một shard (master node), write query sẽ được đẩy vào các tablets này.
* `replica`:  Là tablet phụ (slave node) và có thể được trở thành `primary` tablet khi primary tablet hiện tại gặp sự cố. Các replica tablets chỉ xử lý các read requests.
* `ronly`: Cũng là replica tablet, tuy nhiên không thể trở thành `primary`, thường được config để dùng cho background processing, analytical,...
* `backup`:  Là tablet đã ngừng replication từ một consistent snapshot, nên tablet này có thể lưu bản backup này cho shard của nó và sau đó tiếp tục hoạt động lại bình thường.
* `restore`: Là tablet không có data, đang trong quá trình restore lại data từ latest backup.
* `drained`: Là `ronly` tablet đã được sử dụng bởi Vitess cho các background process nặng như resharding,... và không sử dụng được nữa.

**Topology service**:

Là một cụm các proccess chạy trên nhiều servers, cung cấp topology data và cung cấp tính năng distributed locking.

Vitess bao gồm `1 global topology service` và đối với mỗi cell sẽ có `1 local topology service`  riêng. 
Global topology chứa data về các keyspaces, shards, và các primary tablet cho từng shard.
Các local topology chứa các data về các tablets trong một cell, bao gồm thông tin về replication graph.

**Cell**:

Cell là một cụm các servers và network infrastructure trên cùng một region, các cells là tách biệt nên tránh được failures với các cells khác.

**VReplication:**

Sẽ nói ở section 3.6.

**Other components**:

Ngoài ra thì Vitess còn có kha khá các components với nhiều mục đích khác nhau như **CLI**, **admin GUI**, **Replication Graph**, ...

#### 3.4 Execution Plans.

**Execution plans** là một danh sách các bước để thực thi một câu query, được tạo ra từ input là câu SQL raw nhận được từ client.

Execution plans sẽ ảnh hưởng rất lớn đến performance và tính linh hoạt của database, đặc biệt là trong ngữ cảnh của sharding bởi vì data cần query không phải lúc nào cũng nằm trên cùng 1 shard.

Để tạo ra execution plan thì Vitess sẽ parse câu query ở cả VTGate và VTTablet để tìm ra phương án thực thi tốt nhất đối với một câu query.
Vitess sẽ ưu tiên các plan đẩy khối lượng task xuống MySQL instance phía dưới càng nhiều càng tốt, trong trường hợp không thể (cross-shard query) thì Vitess sẽ sử dụng các plans cho phép lấy data từ nhiều nguồn và sau đó gộp lại thành kết quả hoàn chỉnh ở VTGate.

Example kết quả nhận được từ tool `vtexplain`:

```
vtexplain -shards 8 -vschema-file vschema.json -schema-file schema.sql -replication-mode "ROW" -output-mode text -sql "SELECT * from users"
----------------------------------------------------------------------
SELECT * from users

1 mainkeyspace/-20: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/-20: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/-20: select * from users limit 10001
1 mainkeyspace/20-40: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/20-40: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/20-40: select * from users limit 10001
1 mainkeyspace/40-60: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/40-60: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/40-60: select * from users limit 10001
1 mainkeyspace/60-80: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/60-80: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/60-80: select * from users limit 10001
1 mainkeyspace/80-a0: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/80-a0: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/80-a0: select * from users limit 10001
1 mainkeyspace/a0-c0: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/a0-c0: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/a0-c0: select * from users limit 10001
1 mainkeyspace/c0-e0: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/c0-e0: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/c0-e0: select * from users limit 10001
1 mainkeyspace/e0-: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/e0-: SET collation_connection = utf8mb4_general_ci
1 mainkeyspace/e0-: select * from users limit 10001

-------------------------------------------------------------------
```

Trường hợp này gọi là scatter-query - data được lấy từ tất cả các shards.

Tương tự đối với các cross-shard query thì data cũng sẽ phải lấy từ nhiều nguồn và phải được tổng hợp ở VTGate khiến cho VTGate dễ bị quá tải và ảnh hưởng đến Performance của hệ thống, nên tốt nhất là chọn sharding key sao cho các data liên quan đến nhau sẽ được nằm trên cùng một shard, giúp hạn chế cross-shard query ít nhất có thể.

Example chọn sharding key:

* Table `customer` sẽ sử dụng sharding key là field `customer_id`

```
// SQL
create table customer(customer_id bigint, uname varchar(128), primary key(customer_id));

// Vitess VSchema config
{
  ...
  "tables": {
    "customer": {
      "column_vindexes": [{
        "column": "customer_id",
        "name": "hash"
      }]
    }
  }
}
```

* Table `corder`  chứa thông tin orders của customer cũng sẽ sử dụng sharding key là field `customer_id`

```
// SQL
create table corder(corder_id bigint, customer_id bigint, product_id bigint, oname varchar(128), primary key(corder_id));

// Vitess VSchema config
{
  ...
  "tables": {
    "corder": {
      "column_vindexes": [{
        "column": "customer_id",
        "name": "hash"
      }]
    }
  }
}
```

Với việc cả table `customer` và `corder` đều sử dụng chung sharding key từ field `customer_id` sẽ đảm bảo các orders sẽ nằm trên cùng 1 shard với customer tương ứng.

#### 3.5 Re-sharding

Re-sharding là một feature quan trọng đối với tất cả các sharding system, để có thể giải quyết các vấn đề về hotspot hoặc là chia thừa resources,...

Vitess support Re-sharding với chỉ vài giây readonly-downtime, bao gồm split (chia nhỏ shards) và merge (gộp shards). 
Readonly-downtime tức là các read query vẫn hoạt động bình thường, tuy nhiên các write query sẽ không thể thực thi, tuy nhiên với Vitess thì khoảng thời gian này chỉ xảy ra trong vài giây.

Các trường hợp cần re-sharding thường gặp:

| Requirement                      | Action                          |
| -------------------------------- | ------------------------------- |
| Tăng read capacity               | Thêm replicas hoặc split shards |
| Tăng write capacity              | Split shards                    |
| Chia lại resources lãng phí      | Merge shards                    |
| Tăng capacity theo vị trí địa lý | Thêm cells và replicas          |

Xem thêm: https://vitess.io/docs/13.0/reference/features/sharding/

#### 3.6 VReplication

VReplication là 1 core component được sử dụng trong rất nhiều features của Vitess như: re-sharding, **materialized views**, realtime analytics, data migration, change notification,...

VReplication hoạt động dưới dạng một stream hoặc một set of streams, mỗi stream sẽ tạo replication từ một shard **nguồn** tới một shard **đích**.

Dưới đây là example về một trường hợp cần sử dụng **materialized views** (bằng VReplication) để giải quyết một bài toán cross-shard query, example này cũng chỉ ra rõ hơn cách mà Vitess phân tích và tạo ra execution plans cơ bản cũng như một số vấn đề dễ gặp phải đối với sharding.

Giả sử ta đang code một application marketplace đơn giản, database có 4 tables bao gồm: `users`, `marchants`, `orders` và `products`.  Và giả sử khi hệ thống phát triển và cần scale thì ta quyết định sharding nó bằng Vitess, và việc đầu tiên cần làm là chọn ra đâu là các table cần sharding và sharding dựa trên sharding key nào.

Đầu tiên là table `products`, table này khá ít và không cần sharding, vì vậy ta đặt nó trong một unsharded database (single database).

Table `users` khá lớn, có thể là hàng triệu records, vì vậy ta sharding nó thành 2 shards.

Table `merchants` cũng vậy, nên ta cũng sharding nó thành 2 shards luôn.

Cuối cùng là table `orders`, rất lớn và cần được sharding, tuy nhiên ở đây sẽ có một quyết định khó khăn đó là chúng ta nên chọn sharding key cho table `orders` là gì? Khi một user order một product thì order đó nên được lưu ở đâu?
Để chọn sharding key hợp lí thì ta cần tìm ra relationship quan trọng nhất giữa `orders` và các table khác, tuy nhiên `orders` lại có relationship với cả 3 tables còn lại! 
Đồng nghĩa với việc chọn sharding key dựa trên `user_id`,  `merchant_id` hay `product_id` đều gây ra sự không hiệu quả khi query dựa trên các relationship còn lại.
=> Giả sử ta chọn sharding key cho `orders` là dựa trên column `user_id`, đồng nghĩa với việc các orders sẽ được lưu chung shards với các users của tương ứng.

Quá trình sharding đã xong, giờ là lúc thử nghiệm các câu query đơn giản:

* **Lấy tất cả orders của 1 user:**

\-> câu query dạng này sẽ chạy rất hiệu quả bởi vì orders được lưu chung shard với user tương ứng của nó.

* **Lấy tất cả orders của 1 merchant**:

\-> S1: lấy thông tin `merchant` với merchant_id = 1 từ một shard.
-> S2: gửi scatter query tới **tất cả các shards** để lấy ra tất cả `orders` có merchant_id = 1.
=> Không thực sự hiệu quả, nhưng vẫn có thể chấp nhận được.

* **(Big query) Lấy tất cả orders của một tập users và kèm thông tin products**:

Đây là một câu query lớn và được chia ra làm 2 câu join bởi vì users và orders nằm chung với nhau, nhưng products thì nằm riêng.

\-> S1: Query đến các shards lấy tất cả users kèm orders.
-> S2: (Bad part) Với mỗi order row, fetch product row tương ứng.

Ở câu join với `products` là một problem lớn nếu có nhiều orders, bởi vì mỗi order ta phải thực hiện thêm 1 câu select để lấy product.
Do `products` là một table nhỏ (ví dụ), vì vậy ta có thể giải quyết problem này bằng cách tạo materialized view cho product trên tất cả shards bằng VReplication, listen vào tất cả thay đổi đối với table `products`, thực hiện filter và replicate data qua materialized view trên tất cả các shards (thời gian gần như realtime).
Lúc này data của `products` đã nằm chung với `users` và `orders`, vì vậy Vitess chỉ cần gửi query lấy tất cả `users`, `orders` và `products` tương ứng cùng 1 lúc là được.

#### 3.7 Secondary Vindex

Secondary Vindex được sử dụng để query hiệu quả hơn trên các column không phải Vindex, ví dụ `select * from users where name = 'Loc Vo'`, thì nếu không có Secondary Vindex thì Vitess sẽ phải gửi scatter query đến tất cả các shards để tìm ra a Lộc.

Secondary Vindex sẽ trả về một hoặc một set keyspace IDs giúp cho VTGate biết được các shards có thể chứa data tương ứng, và không liên quan đến index trong MySQL instance phía bên dưới của VTTablet.

#### 3.8 Các limit của Vitess

##### 3. 8.1 Cross-shard transactions

By default Vitess không support cross-shard transactions, mặc dù có thể dùng 2PC để hỗ trợ tuy nhiên chỉ đạt được tính atomic (A trong ACID) và đồng thời cost đối với write query sẽ tăng cao.

##### 3.8.2 Cross-shard joins

Vitess cho phép cross-shard joins tuy nhiên nó hoạt động không hiệu quả và khối lượng tasks VTGate phải handle là khá lớn, do đó nên design schema và optimize query sao cho hạn chế cross-shard query nhiều nhất có thể.

##### 3.8.3 Unsupported cases

Không phải tất cả query đều hoạt động khi migrate từ MySQL sang Vitess, Vitess có một list các `Unsupported cases` có thể xem ở đây: <https://github.com/vitessio/vitess/blob/main/go/vt/vtgate/planbuilder/testdata/unsupported_cases.txt>

Phần lớn xảy ra đối với scatter query và cross-shard joins, khi migrate từ MySQL cần chú ý sử dụng VTExplain để check tất cả các câu query đang chạy để xem liệu Vitess có handle được hay không.

#### 3.9 Conclusion

Vitess hỗ trợ gần như mọi features/tools cần thiết đối với một sharding system, tuy nhiên operation của Vitess khá phức tạp và bắt buộc developer phải thực sự hiểu và optimize application để có thể hoạt động hiệu quả khi migrate sang Vitess.

Đây có thể vừa là điểm mạnh vừa là điểm yếu của Vitess,

Điểm mạnh là vì nó buộc developer phải hiểu về sharding system của mình, và buộc phải optimize application cho phù hợp với ngữ cảnh distributed DB.

Điểm yếu là vì nó complex, không resilient như các NewSQL (TiDB, CockroachDB,...), quá trình migration tốn nhiều effort.

Đối với mình, ở thời điểm hiện tại, nếu cần Horizontal scale một DB đang chạy, mình sẽ chọn TiDB thay vì Vitess để giảm thiểu chi phí cho quá trình migration và cả monitoring sau khi migrate.

- - -

### Reference

* MySQL Partitioning: <https://dev.mysql.com/doc/mysql-partitioning-excerpt/8.0/en/partitioning.html>
* Vitess Guide: <https://vitess.io/docs/13.0/user-guides/vschema-guide/>
* Vitess unsupported cases: <https://github.com/vitessio/vitess/blob/main/go/vt/vtgate/planbuilder/testdata/unsupported_cases.txt>
* Vitess vtexplain: <https://vitess.io/docs/13.0/user-guides/sql/vtexplain/>
* Life of A Query: <https://github.com/vitessio/vitess/blob/main/doc/LifeOfAQuery.md>
* Bài present ở QCon: <https://www.infoq.com/presentations/vitess/>
* How to migrate a MySQL Database to Vitess: https://www.cncf.io/wp-content/uploads/2020/08/Migrating-MySQL-to-Vitess-CNCF-Webinar.pdf<https://www.cncf.io/wp-content/uploads/2020/08/Migrating-MySQL-to-Vitess-CNCF-Webinar.pdf>
* Vitess vs TiDB: <https://en.pingcap.com/case-study/tidb-in-yuanfudao/>