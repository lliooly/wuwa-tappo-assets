# Wuwa Tappo 素材归档

本仓库整理《鸣潮》桌宠 **Wuwa Tappo CN 1.0.2** 的客户端内置美术素材，以及 2026-10-30 官方公开图鉴索引中的角色、配件和表情素材。它是非官方整理项目，并非库洛游戏及其关联公司的官方发布；本仓库不声明已获得其授权。

> 仓库公开不代表素材获得开放授权。角色、美术、标识及 SDK 素材的权利属于各自权利人；使用前请自行确认适用的授权和官方规则。字体有各自的第三方许可，详见 [字体授权](docs/字体授权.md)。

## 素材目录

| 类别 | 内容 | 索引 |
| --- | --- | --- |
| [角色](assets/角色) | 260 个外观，含完整图、图鉴图及头身动作分层 | [角色图鉴](docs/图鉴/角色.md) |
| [配件](assets/配件) | 135 个配件及图鉴图 | [配件图鉴](docs/图鉴/配件.md) |
| [表情](assets/表情) | 504 个表情；相同图鉴图只存一份 | [表情图鉴](docs/图鉴/表情.md) |
| [界面](assets/界面) | 原版界面、安装/登录界面和登录 SDK 图片 | [目录与命名](docs/目录与命名.md) |
| [图标](assets/图标) | Windows 原生图标和发行包图标 | [目录与命名](docs/目录与命名.md) |
| [字体](assets/字体) | 客户端中的 12 个 WOFF2 字体 | [字体授权](docs/字体授权.md) |

公开索引共指向 3,098 个图片地址，去重后以实际文件保存。图鉴包含尚未解锁的素材，但本仓库不含任何账号的解锁状态。

## 使用与数据

- [使用指南](docs/使用指南.md)：本地文件、HTML/CSS、JavaScript 和角色分层示例。
- [机器可读图鉴](data/catalog.json)：条目、图片路径、原始 ID、尺寸、SHA-256 和布局元数据。
- [历史名称映射](data/aliases.json)：内容相同时将旧名称映射到同一实际文件；仓库本身不依赖符号链接。
- [文件校验清单](data/files.json)：所有素材文件的大小与 SHA-256。
- [来源快照](data/来源快照)：官方图鉴、素材索引、名称字典和本地恢复记录。

```bash
git clone https://github.com/lliooly/wuwa-tappo-assets.git
cd wuwa-tappo-assets
python3 scripts/verify-assets.py
```

## 权利和联系

- [素材来源与版权](docs/版权与来源.md)
- [免责声明](docs/免责声明.md)
- [删除请求与联系方式](docs/删除请求.md)
- [通过 GitHub Issue 联系维护者](https://github.com/lliooly/wuwa-tappo-assets/issues/new?template=rights.yml)

请勿在公开 Issue 中提交身份证件、住址、电话等敏感信息。权利人也可以使用 [GitHub 的正式内容移除流程](https://docs.github.com/en/site-policy/content-removal-policies/submitting-content-removal-requests)。
