---
layout: post
title: Tâm lý chủ quan của dev và tầm quan trọng của tester
date: 2021-01-10T08:52:45.524Z
modified: 2021-01-10T08:52:45.535Z
image: /assets/img/upload/tester-developer-think1.jpg
tag:
  - Lảm nhảm
description: Tâm lý chủ quan của dev và tầm quan trọng của tester trong software development
---
<figure><img src="/assets/img/upload/tester-developer-think1.jpg" alt="Hướng suy nghĩ của Dev vs Tester"><figcaption>Image on <a href="blog.qatestlab.com">blog.qatestlab.com</a></figcaption></figure>

Một chủ đề nhức nhói và chắc hẳn đã quá quen thuộc đối với mọi người - những người đã và đang lăn lộn (hoặc phè phỡn?!) trong mảng software development.

**Disclaimer**: Đây là một bài viết có "đôi chút" khuynh hướng đã kích đối với một số developer, bao gồm cả bản thân mình về tâm lý chủ quan và sự tự tin quá mức đối với code của họ. Do đó, nếu như bạn cảm thấy bị tổn thương khi đọc bài blog này thì... kệ bạn, blog của mình nên mình thích thì mình viết thôiiii.



## Tâm lý chủ quan của Dev

> Vô lý, chỗ đó sao bug được...
>
> Bug là đúng rồi, chỗ đó đâu cho để trống...
>
> Chỗ này phải nhập đúng flow như này, như này nè... user nhập bậy bạ thì ráng chịu thôi...

Đây là những câu nói "cửa miệng" của nhiều developer khi có bug xảy ra, tất nhiên không phải ai cũng vậy nhưng số developer mắc bệnh này thì nhiều vô số kể. 

Khi code thì developer ít khi suy nghĩ dưới góc nhìn của end user do đó thường chỉ cover các case chính (hay case **đúng**) và sót lại vô số các case ad-hoc (case **sai**, sai đối với developer chứ không phải sai với user 🤣), hậu quả là khi sản phẩm được sử dụng bởi các end user ngây ngô thì vô số các bug dở khóc dở cười xảy ra và lúc này chúng ta chỉ còn biết vừa trách móc họ và vừa fix bug trong hậm hực mà thôi.

Đây là chuyện thường như ở huyện nhưng vấn đề đáng nói ở đây là dường như tâm lý của developer chúng ta vẫn không thay đổi sau khi gặp vấn đề này rất nhiều lần, vẫn không nhận ra rằng mình đang thiếu **mindset của một end user**, vẫn bỏ qua các case ad-hoc và tự nhủ rằng "chắc không có ai khùng dữ vậy đâu".

Ngoài ra có nhiều trường hợp chỉ đơn giản là do lười biếng (hoặc deadline dí đến đít ?!) mà chúng ta bỏ qua vô số các case đã lường trước là hoàn toàn có thể xảy ra nhưng rất hiếm. Ví dụ bản thân mình có một lần làm feature upload và bán video cho một công ty X, vì business của app này là bán video nên việc upload video là bắt buộc, trên GUI mình cũng đã cho hiện thị một dấu hoa thị đỏ to chà bá (require) tuy nhiên vì lười mình đã bỏ qua bước validate video với suy nghĩ "kệ đi, đâu có ai bán video mà lại không upload video" thế là khi sản phẩm release một thời gian thì mình lại cặm cụi fix bug và thêm validate cho nó 🥲 mặc dù đây chỉ là một issue nhỏ nhưng không phải là duy nhất, vẫn còn vô số issues kiểu như vậy.

Tóm lại thì nguyên nhân gốc vẫn là sự thờ ơ, lười biếng và thiếu trách nhiệm đối với sản phẩm "của người khác". Vì sao lại là của người khác?! À vì tụi mình chỉ là code thuê cho công ty thôi mà 🤣 Đúc kết lại được một câu:

> Đừng bao giờ tin tụi dev



### Người hùng mang tên Tester

Nhiều người và nhiều công ty IT không coi trọng tester vì không nhìn thấy tầm ảnh hưởng của họ lên chất lượng của sản phẩm, và cũng có các công ty không có (hoặc ít) tester để giảm chi phí hoạt động đặc biệt là ở các công ty startup ít vốn, team chỉ có vài người toàn là developer và designer.

Đối với những công ty như vây, thực sự rất khó để có thể cho ra một sản phẩm thực sự chất lượng. Tất nhiên họ có thể rất đam mê, rất tâm huyết, nhưng developer thì vẫn là developer, họ không có đủ sự tỉ mi, cẩn thận và chi tiết, sản phẩm họ làm ra có thể rất xịn nhưng kèm theo đó là vô số bugs mà fix đến mùa quýt năm sau cũng không hết.

Do đó bất kì sản phẩm nào muốn có chất lượng và sự ổn định thì đều cần sự hiện diện của tester, những người đóng vai trò là chốt chặn cuối cùng trước khi sản phẩm đến tay end user.

Tóm lại là các công ty không nên vì tiết kiệm tiền lương mà tự hạ thấp chất lượng sản phẩm của mình và cũng đồng nghĩa tự kiềm hãm sự phát triển của sản phẩm!



That it!! Một bài blog nhảm nhí không đầu không đuôi nhưng hi vọng cũng tát được vào mặt một vài bạn dev nào đó vô tình đọc được 🙃 🙃 Chúc mọi người một ngày vui vẻ!!