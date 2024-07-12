## LiteLoaderQQNT-NekoImageGallerySearch

[![wakatime](https://wakatime.com/badge/github/pk5ls20/LiteLoaderQQNT-NekoImageGallerySearch.svg)](https://wakatime.com/badge/github/pk5ls20/LiteLoaderQQNT-NekoImageGallerySearch)
[![English README](https://img.shields.io/badge/English-README-blue)](README.md)

又一个[NekoImageGallery](https://github.com/hv0905/NekoImageGallery)的web UI,
使用Vue开发，并通过[LiteLoaderQQNT](https://liteloaderqqnt.github.io)与NTQQ**无缝结合**

> [!NOTE]
>
> 想在 NTQQ 中使用 [NekoImageGallery.App](https://github.com/hv0905/NekoImageGallery.App)
> 吗？没问题，来试试 [NekoImageGallery.LiteLoader.App](https://github.com/pk5ls20/NekoImageGallery.LiteLoader.App)
> 吧（目前正处于相当早期的 WIP 阶段，欢迎您的 PR！）

## 预览

-----

![search-demo.gif](web/screenshot/search-demo.gif)

![i2i-demo.gif](web/screenshot/i2i-demo.gif)

-----

## 安装

### 从[Releases](https://github.com/pk5ls20/LiteLoaderQQNT-NekoImageGallerySearch/releases)下载稳定版插件 **（推荐）**
1. 从[Releases](https://github.com/pk5ls20/LiteLoaderQQNT-NekoImageGallerySearch/releases)下载构建好的`LiteLoaderQQNT-NekoImage.zip`
2. 解压压缩包至插件路径

### 从Action中的Artifacts下载最新构建版插件
1. 从Action中的Artifacts下载构建好的`LiteLoaderQQNT-NekoImage.zip`
2. 解压压缩包至插件路径

### 手动构建并安装

#### 手动构建
```shell
npm install -g yarn
yarn install && yarn plugin-build
```
#### 手动安装
```shell
cp -r LiteLoaderQQNT-NekoImage /path/to/your/LiteloaderQQNT/plugin-path
```

## 已知问题及开发路线图

> 更多的已知问题以及开发路线图参见[RoadMap](https://github.com/users/pk5ls20/projects/5)


## 测试环境
本插件在以下环境中开发并测试通过：
- Windows 11 + QQ >9.9.9-22920 + LiteLoaderQQNT >1.1.1
- Manjaro Linux + QQ >3.2.9-24568 + LiteLoaderQQNT >1.1.1

## 参考及特别致谢

感谢以下项目，`LiteLoaderQQNT-NekoImage`的诞生离不开你们！

- https://github.com/hv0905/NekoImageGallery.App
- https://github.com/xtaw/LiteLoaderQQNT-Fake-Message
- https://github.com/MUKAPP/LiteLoaderQQNT-DeepL
- https://github.com/xh321/LiteLoaderQQNT-QR-Decode
- https://github.com/xiyuesaves/LiteLoaderQQNT-lite_tools
- https://github.com/Night-stars-1/LiteLoaderQQNT-Plugin-LLAPI
- https://github.com/LLOneBot/LLOneBot
- https://github.com/darkreader/darkreader
- （代码注释中提到的更多项目）
