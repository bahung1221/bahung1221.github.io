---
layout: post
title: Triển khai GoCD trên on-premise servers
date: 2022-06-27T09:28:49.884Z
modified: 2022-06-27T09:28:49.914Z
image: /assets/img/upload/003185fb-84ac-48e0-a75f-c27b730d5bbe_gocd_blogpost-followup-2x-1-.jpg
tag:
  - Tech
description: GoCD là một open-source & self-hosted CI/CD server hướng tới các
  enterprise muốn tự triển khai CI/CD system thay vì sử dụng các cloud CI/CD
  services như CircleCI, AWS Code Deploy,...
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