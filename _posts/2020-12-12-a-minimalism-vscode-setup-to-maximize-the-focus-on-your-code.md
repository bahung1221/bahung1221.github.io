---
layout: post
title: A minimalism VSCode setup to maximize the focus on your code
date: 2020-12-12T08:18:34.442Z
modified: 2020-12-12T08:18:34.482Z
description: A minimalism VSCode setup to maximize the focus on your code
tag:
  - Lảm nhảm
  - VSCode
  - Minimalism
image: /assets/img/upload/screen-shot-2020-12-12-at-11.41.55.png
keywords:
  - VSCode
  - Visual Studio Code
  - Minimalism
  - Code Editor
  - VSCode Theme
---
![My minimalism VSCode screen ❤](/assets/img/upload/screen-shot-2020-12-12-at-11.41.55.png "My minimalism VSCode screen ❤")

I just switch to VSCode one month ago because all of my colleagues used it. Honestly, at the first look, I really hate the UX of it, a ton of things was meshing up on my screen, that I even never use.

My habit is do everything on a separator terminal instance, the code editor was only used for coding, so I just want my code editor shows the explorer and the editor, that’s all :P

Additional, the default search explorer of VSCode is so small and it’s uncomfortable for me, I don’t want to read a lot of text in a limited space like that. Fortunately, VSCode has an option to allow me to move the search explorer to the bottom panel, so I can enjoy a larger space ❤

Below are my steps to customize my VSCode to achieve true minimalism and more comfortable to use ❤



### 1. Hide all the tabs on the left explorer, only remain the file explorer

By default, VSCode will show 6 tabs in the left explorer: Open Editors, Folder, Outline, Timeline and NPM Scripts. I only need Folder tab (file explorer), so just hide all the other tabs:

* Click the **“thee dots icon”** at the top right corner on the left explorer.
* Uncheck to all tabs!

![Hide all tabs on the left explorer](/assets/img/upload/1-1-.png "Hide all tabs on the left explorer")

### 2. Move the Activity Bar from the left to bottom of file explorer

he activity bar on the left hand occupies part of the screen space is unnecessary. To minimize it, we will use [Customize UI](https://marketplace.visualstudio.com/items?itemName=iocave.customize-ui) extension, because VSCode doesn’t support out of the box for this option.

After installed **Customize UI** extension, you will be asked to enable **Monkey Patch**, enable it and then add below lines to your **[settings.json](https://code.visualstudio.com/docs/getstarted/settings)**:

```json
"customizeUI.activityBar": "bottom",
"customizeUI.activityBarHideSettings": true
```

\
Then reload your editor!

![Move the Activity Bar to the bottom instead of left](/assets/img/upload/2-1-.png "Move the Activity Bar to the bottom instead of left")

### 3. Hide the “Editor Actions” bar

I always use keyboard shortcut or command palette to perform **git/editor actions** and try to avoid using mouse as much as possible. So the Editor Actions bar on the top right corner is unnecessary for me.

To hide it, add below lines to your **settings.json:**

```json
"customizeUI.stylesheet": {
    ".tabs-and-actions-container .editor-actions": "display: none !important;"
}
```

![Hide the Editor Actions bar](/assets/img/upload/3-1-.png "Hide the Editor Actions bar")

### 4. Hide the minimap

The minimap on the right hand is useless for me and I can easily enable it by command palette when necessary, so I hid it.

To hide it, add below line to your **settings.json:**

```json
"editor.minimap.enabled": false
```

![Hide the minimap](/assets/img/upload/4-1-.png "Hide the minimap")

### 5. Change file icon theme

By default, VSCode file explorer will show a lot of icons based on your project file types. In my opinion, I think it isn’t necessary and it also affect the UI of the editor a bit, so I switched to minimal file icon that will only show two icons: one icon for folder and one icon for all file types.

To use **minimal file icon**, add this line to your **settings.json**:

```json
"workbench.iconTheme": "vs-minimal"
```

![Change file icon to “minimal file icon theme”](/assets/img/upload/5-1-.png "Change file icon to “minimal file icon theme”")

### 6. (Opinion) Change color theme and font family

Color theme and font family are things that we can’t say what one is better than another one. For me, the color theme and font-family is affected a lots to overall UI of the editor, so these are just my opinion choices.

I want the color theme must be cool and bluish clean for my eyes. Fortunately, **[Nord theme](https://marketplace.visualstudio.com/items?itemName=arcticicestudio.nord-visual-studio-code&ssr=false)** did it perfectly ❤ If you like it, just install and feels :P

Another important part is **font family**, I’m usin **[Source Code Pro](https://github.com/adobe-fonts/source-code-pro)** font. If you want to try it, do below steps:

* Download TTF font folder on <https://github.com/adobe-fonts/source-code-pro>
* Install all the fonts that you downloaded (just double click to them)
* Add below lines to your VSCode **settings.json:**

```json
"editor.fontFamily": "Source Code Pro",
"editor.fontSize": 14,
"customizeUI.font.regular": "Source Code Pro",
"customizeUI.font.monospace": "Source Code Pro"
```

### 7. (Opinion) Move search explorer to the bottom panel for wider space and better search experience

Like I said in the beginning of this blog, the default search explorer of VSCode is so small and it’s uncomfortable for me. So I moved it to the bottom panel!

If you want to try, do below steps:

* Just open the bottom panel, **cmd + j** on macOs or **View > Appearance > Show Panel**.
* Drag the **search icon** from activity bar to **bottom panel**

![Move the search explorer to bottom panel for wider space!](/assets/img/upload/6.png "Move the search explorer to bottom panel for wider space!")

\
\
That’s it!!! Hope that will be helpful for your daily work. And sorry for my bad English :D

Thanks and kind regards to VSCode team who made an amazing open source code editor, that powerful and easy to customize, and made the life of developers easier ❤