<div align="center">
  <img src="assets/界面/原版/logo.png" width="150" alt="Wuwa Tappo 标识">
  <h1>Wuwa Tappo 素材归档</h1>
  <p><strong>为 Wuwa Tappo CN 1.0.3 整理可追溯的客户端素材与公开图鉴数据。</strong></p>
  <p>提供按用途分类的素材文件、机器可读索引，以及可搜索的在线图鉴，方便查找、核对和集成。</p>
  <p>
    <a href="https://lliooly.github.io/wuwa-tappo-assets/">在线图鉴 ↗</a> ·
    <a href="#quick-start">快速开始</a> ·
    <a href="#catalog">素材目录</a> ·
    <a href="#data">数据格式</a> ·
    <a href="#rights">来源与授权</a>
  </p>
  <p>
    <a href="https://github.com/lliooly/wuwa-tappo-assets/actions/workflows/pages.yml"><img src="https://img.shields.io/github/actions/workflow/status/lliooly/wuwa-tappo-assets/pages.yml?branch=main&style=flat-square&label=Pages" alt="GitHub Pages 工作流状态"></a>
    <img src="https://img.shields.io/badge/reference-Wuwa_Tappo_CN_1.0.3-6F5B95?style=flat-square" alt="参考版本：Wuwa Tappo CN 1.0.3">
    <img src="https://img.shields.io/badge/catalog-899_entries-23856D?style=flat-square" alt="公开图鉴：899 个条目">
  </p>
</div>

<a id="overview"></a>
## 项目概览

本仓库是 Wuwa Tappo CN 1.0.3 的非官方素材与数据快照，整理客户端内置资源和公开图鉴中的角色、配件及表情素材。仓库同时提供目录说明、逐文件校验数据，以及由同一份索引生成的静态图库。

公开图鉴快照记录 **899 个条目**：260 个角色外观、135 个配件和 504 个表情。索引指向 3,098 个图片地址；按文件内容去重后，仓库保存 2,791 个素材文件。快照日期为 **2026-10-30**。

> **非官方归档。** 本仓库不代表库洛游戏或其关联公司，也不声明获得素材再分发授权。仓库公开不等于素材获得开放许可；使用前请核对权利人和适用规则。

<a id="gallery"></a>
## 在线图鉴

[打开 Wuwa Tappo 素材图鉴](https://lliooly.github.io/wuwa-tappo-assets/)

图鉴覆盖角色、配件、表情、界面、图标和字体。页面支持按类别与资源用途筛选、搜索名称或文件名、查看尺寸和仓库路径、复制路径及打开原文件，并提供中英文切换和明暗主题。

<a id="catalog"></a>
## 素材目录

| 类别 | 内容 | 浏览索引 |
| --- | --- | --- |
| [角色](assets/角色) | 260 个角色外观，含完整图、图鉴图及头身动作分层 | [角色图鉴](docs/图鉴/角色.md) |
| [配件](assets/配件) | 135 个配件，区分佩戴素材图和图鉴图 | [配件图鉴](docs/图鉴/配件.md) |
| [表情](assets/表情) | 504 个表情；当前快照中相同的图鉴图与素材图共用文件 | [表情图鉴](docs/图鉴/表情.md) |
| [界面](assets/界面) | 原版界面、安装与登录界面、登录 SDK 图片 | [目录与命名](docs/目录与命名.md) |
| [图标](assets/图标) | Windows 原生图标和发行包图标 | [目录与命名](docs/目录与命名.md) |
| [字体](assets/字体) | 客户端中提取的 12 个 WOFF2 字体 | [字体来源与许可](docs/字体授权.md) |

角色分层、配件佩戴和图鉴展示有不同的选图规则。开始使用素材前，请先阅读 [使用指南](docs/使用指南.md)；维护目录、别名或素材时，请遵循 [素材使用与维护规则](AGENTS.md)。

<a id="quick-start"></a>
## 快速开始

### 获取并核对素材

```bash
git clone https://github.com/lliooly/wuwa-tappo-assets.git
cd wuwa-tappo-assets
python3 scripts/verify-assets.py
```

校验脚本使用 Python 3 标准库，检查素材文件的大小与 SHA-256，并核对图鉴路径和历史名称映射。

### 本地运行在线图鉴

需要 Node.js 22 和 npm。图库使用 Astro 7.2.8 构建，`npm ci` 根据锁文件安装依赖；开发和构建前会自动从素材索引生成图库数据。

```bash
cd site
npm ci
npm run dev
```

构建并预览生产版本：

```bash
npm run build
npm run preview
```

推送到 `main` 后，[GitHub Actions 工作流](.github/workflows/pages.yml)会构建图库并部署到 GitHub Pages。

<a id="data"></a>
## 数据格式与项目结构

| 路径 | 内容 |
| --- | --- |
| [`data/catalog.json`](data/catalog.json) | 公开图鉴条目、素材类型、名称、ID、实际文件路径、尺寸、SHA-256 和布局元数据。 |
| [`data/files.json`](data/files.json) | 2,791 个去重素材文件的路径、大小和 SHA-256。 |
| [`data/aliases.json`](data/aliases.json) | 534 个历史名称到仓库实际文件路径的映射；映射不是符号链接。 |
| [`data/来源快照/`](data/来源快照/) | 公开索引、语言名称、素材地址及本地恢复记录。 |
| [`docs/`](docs/) | 使用指南、类别图鉴、目录说明、字体许可和权利信息。 |
| [`site/`](site/) | Astro 图鉴页面、交互脚本和构建配置。 |
| [`scripts/verify-assets.py`](scripts/verify-assets.py) | 使用标准库校验素材文件、图鉴引用和别名。 |
| [`.github/workflows/pages.yml`](.github/workflows/pages.yml) | 在 `main` 更新后构建并部署 GitHub Pages。 |

图鉴快照包含未解锁素材，但不含个人账号的解锁状态。查询时应按 `type` 和素材 ID 或 `officialFilename` 找到目录项，并读取其 `files` 字段中的真实路径；不要仅凭相同文件名替换不同用途的图片。

<a id="rights"></a>
## 来源、授权与联系

本仓库整理的是特定版本和时间点的快照；官方新增、修改或不再公开的内容不在快照范围内。素材来源、权利说明和联系渠道见以下文档：

- [素材来源与版权](docs/版权与来源.md)
- [免责声明](docs/免责声明.md)
- [删除请求与联系方式](docs/删除请求.md)
- [字体来源与许可](docs/字体授权.md)

仓库没有适用于全部内容的根级许可证，也没有为游戏美术、角色、标识或 SDK 内容授予 MIT、CC 等开放许可。`LICENSES/` 中的许可证仅对应相关第三方字体，不能用于推断其他素材的授权状态。权利人可通过 [版权与删除请求 Issue 模板](https://github.com/lliooly/wuwa-tappo-assets/issues/new?template=rights.yml) 联系维护者；请勿在公开 Issue 中提交身份证件、住址、电话等敏感信息。也可使用 [GitHub 正式内容移除流程](https://docs.github.com/en/site-policy/content-removal-policies/submitting-content-removal-requests)。
