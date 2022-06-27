---
layout: post
title: Triển khai GoCD trên on-premise servers
date: 2022-06-27T09:28:49.884Z
modified: 2022-06-27T09:28:49.914Z
image: /assets/img/upload/whole_map.png
tag:
  - Tech
description: GoCD là một open-source & self-hosted CI/CD server hướng tới các
  enterprise muốn tự triển khai CI/CD system thay vì sử dụng các cloud CI/CD
  services như CircleCI, AWS Code Deploy,...
---
![Sample GoCD Pipelines](/assets/img/upload/whole_map.png "Sample GoCD Pipelines")



Công ty mình có rất nhiều projects nhỏ nhỏ đang trong quá trình triển khai và vận hành nên việc phải ghi chú step-to-deploy cho từng project khá là phiền phức và tốn thời gian, do đó vừa rồi mình đã có dịp triển khai **[GoCD](https://www.gocd.org/)** cho công ty của mình để đơn giản hóa quá trình deployment này. 

Bài blog này mình sẽ chia sẻ lại một số thông tin cơ bản về GoCD mà mình biết được thông qua quá trình research và triển khai thực tế.



**[GoCD](https://www.gocd.org/)** là một open-source & self-hosted CI/CD server hướng tới các enterprise muốn tự triển khai CI/CD system thay vì sử dụng các cloud CI/CD services như CircleCI, AWS Code Deploy,...