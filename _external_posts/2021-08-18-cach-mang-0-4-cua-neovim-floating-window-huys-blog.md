---
layout: external_post
title: "Cách mạng 0.4 của Neovim: Floating Window | Huy's Blog"
crawl_date: 2022-10-09T12:58:49Z
image: https://snacky.blog/posts/img/vim-float-term/avatar.jpg
blog: https://snacky.blog
original_url: https://snacky.blog/posts/vim-play-with-floating.html
original_publish_date: 2021-08-18T12:58:49Z
---

Neovim từ phiên bản 0.4 có một chức năng cực kì hay ho đó là floating windows, giúp hiển thị một buffer ở bất kì vị trí nào trên màn hình. Nên nhớ là chúng ta đang nói đến Neovim, một editor hoạt động trên terminal, nơi mà mọi thứ chỉ là text và không hề có các khái niệm về giao diện đồ họa.

Sau khi chức năng này được release thì cộng đồng Neovim đã adopt nó khá nhanh, rất nhiều plugin áp dụng nó khá hiệu quả ví dụ như coc.nvim hay denite.nvim.

Trong bài viết này, chúng ta sẽ cùng tìm hiểu về floating window thông qua việc build một chức năng giúp cho Neovim có thể mở nhanh một cửa sổ terminal emulator, nằm floating trên màn hình. Mình thường dùng chức năng này khi cần thực hiện nhanh một thao tác nào đó như tạo git branch, push hoặc pull code mà lười xài Tmux.
