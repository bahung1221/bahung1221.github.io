---
layout: post
title: Giới thiệu GoCD và triển khai trên on-premise servers
date: 2022-06-27T09:28:49.884Z
modified: 2022-06-27T09:28:49.914Z
image: /assets/img/upload/003185fb-84ac-48e0-a75f-c27b730d5bbe_gocd_blogpost-followup-2x-1-.jpg
tag:
  - Tech
description: GoCD là một open-source & self-hosted CI/CD server hướng tới các
  enterprise muốn tự triển khai CI/CD system thay vì sử dụng các cloud CI/CD
  services như CircleCI, AWS Code Deploy,...
keywords:
  - Tech
  - DevOps
  - CI/CD
---
![GoCD](/assets/img/upload/003185fb-84ac-48e0-a75f-c27b730d5bbe_gocd_blogpost-followup-2x-1-.jpg "GoCD")

Công ty mình có rất nhiều projects nhỏ nhỏ đang trong quá trình triển khai và vận hành nên việc phải ghi chú step-to-deploy cho từng project khá là phiền phức và tốn thời gian, do đó vừa rồi mình đã có dịp triển khai **[GoCD](https://www.gocd.org/)** cho công ty của mình để đơn giản hóa quá trình deployment này. 

Bài blog này mình sẽ chia sẻ lại một số kinh nghiệm về GoCD mà mình biết được thông qua quá trình research và triển khai thực tế.

### 1. Giới thiệu GoCD

**[GoCD](https://www.gocd.org/)** là một open-source & self-hosted CI/CD server hướng tới các enterprise muốn tự triển khai CI/CD system thay vì sử dụng các cloud CI/CD services như CircleCI, AWS Code Deploy,...

Việc tự triển khai sẽ giúp chúng ta dễ dàng kiểm soát và custom cho các pipelines của mình, đặc biệt là đối với các usecases riêng biệt (khác người).

### 2. GoCD Architecture

![GoCD Architecture](/assets/img/upload/c83f4-gocd-deployment-on-rancher-s-az-ec2-hosts.jpeg "GoCD Architecture")

GoCD bao gồm các components chính là Go Server, Go Agent, Pipeline, Job, Task, Material, Artifact,...



#### 2.1 Go Server

Go Server đóng vai trò là coordinator trong toàn bộ hệ thống, đây là nơi chứa các configs, thông tin các agents, pipelines,...

Go Server cũng sẽ quyết định Agent nào sẽ đảm nhiệm Task gì của các Pipeline trong quá trình thực thi.



#### 2.2 Go Agent

Go Agent được xem như là những "worker" trong hệ thống của GoCD, làm nhiệm vụ thực thi các Task (build, test, deploy,...).

Một hệ thống GoCD sẽ có thể có 1 hoặc nhiều Go Agent nằm ở một hoặc nhiều machine khác nhau, các Agent kết nối với Go Server thông qua API (HTTP protocal).



#### 2.3 Pipeline

Pipeline là các workflows tự định nghĩa... Thôi mình giải thích bằng ví dụ cho dễ hình dung hen:

Khi chúng ta muốn deploy một version mới cho trang blog chẳng hạn, chúng ta sẽ phải trải qua 3 stage bao gồm: **build, test và deploy**. Thì đây chính là 1 **pipeline,** tất nhiên pipeline không nhất thiết phải có 3 stage trên, nó có thể có bất kì stage nào với bất kì mục đích gì tùy chúng ta định nghĩa.



#### **2.4 Other**

Ngoài ra còn có các thành phần quan trọng khác cần lưu ý như Job, Task, Material, Artifact, Resources, Auth,... Tuy nhiên chúng khá đơn giản và các bạn có thể tìm hiểu trong lúc triển khai GoCD sau này, do đó mình không nói đến chi cho dong dài :D



### 3. Mình đã triển khai thực tế như thế nào?

Để dễ hình dung, mình chỉ lấy ví dụ triển khai GoCD cho trang blog của công ty, các project/product khác thì cũng tương tự.

Mình có 2 server on-premise như sau:

\- **Server 1**: là server mới mua, dùng để build code.

\- **Server 2**: là server production, hiện đang serve trang blog của công ty mình.

Mình đã setup như sau:

\- **Server 1**: Chứa Go Server (dùng Docker cho gọn) và 1 Go Agent được chỉ định là **Agent build**.

\- **Server 2:** Chứa 1 Go Agent được chỉ định là **Agent deploy** cho production code, Agent này sẽ được chạy sau khi **Agent build** ở server 1 hoàn thành công việc của mình, **Agent deploy** sẽ fetch **artifact** (code đã build) từ **Agent build** và sau đó chạy shell script để copy artifact này sang working dir của NGINX và làm một số tác vụ râu ria.



That's it!!! Workflow của GoCD sau khi triển khai là khá đơn giản, tuy nhiên trong quá trình triển khai thì mình đã gặp một số vấn đề khá là khó chịu, ví dụ như:

**Development ở local machine**: 

Documentation của GoCD về phần này rất hạn chế, mình đã setup được Go Server và Go Agent ở local và sau đó config blabla,... Nhưng sau đó thì không biết làm sao để sync config này lên server build production bởi vì folder config của con Go Server chứa cả tá file và folder, mình không biết được đâu là file cần sync lên server build production =.=

Sau quá trình thử sai thì mình cũng đã xác định được các file config cần sync lên Go Server là: \`/config/cruise-config.xml\` và \`config/cipher.aes\` (để decrypt các passwords).

**Phân quyền trên server:**

GoCD (cả Server và Agent) khi chạy trên server đều sẽ sử dụng user riêng là **go** thay vì user **root** hoặc bất kì user nào khác để đảm bảo security, tuy nhiên nó lại dẫn tới vấn đề trong quá trình deployment đặc biệt là đối với các project đã chạy từ trước.

*Tóm gọn như sau*: folder chứa source code cho trang blog được phân quyền owner là user **nginx**, tuy nhiên user của Go Agent lại là user **go**, chính vì vậy Go Agent không thể move code đã built vào folder blog được. Do đó mình đã phải làm 1 số dirty workaround để có thể switch user trong quá trình deployment để có thể đạt được mục đích =.=!

Tất nhiên việc này liên quan đến security nên mình không dám đánh giá đây là pros hay cons, tuy nhiên với structure cũng như phân quyền hiện tại của server production thì mình buộc phải workaround để có thể làm nó hoạt động.

**Quá nhiều logggggg trên console**:

Khi có error, crash,... thì mình cần phải mở **console/file logs** để tìm kiếm stacktrace, tuy nhiên, các info/warning logs của GoCD phải nói là rất rất nhiều, loãng và rối, khiến quá trình debug trở nên rất khó chịu.

Mình không rõ issue này có config được không tuy nhiên first look là nó không được phân loại kĩ lưỡng cho lắm.



### 4. Lời kết

GoCD **sau khi triển khai xong** thì khá dễ sử dụng, giao diện đơn giản (đẹp hơn Jenkins :'), dễ dàng và flexible trong quá trình custom các pipelines. Phù hợp với các tech company thích dùng hàng self-hosted hơn là dùng các cloud CI/CD services.