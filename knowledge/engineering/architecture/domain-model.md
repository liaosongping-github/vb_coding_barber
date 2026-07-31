---
title: 核心领域模型
owner_role: engineering
status: reviewed
applies_to: v0.1+
last_verified_at: 2026-08-01
related: knowledge/business/service-flow.md
---

# 核心领域模型

| 实体 | 责任 |
|---|---|
| User | 微信身份、手机号、昵称头像、收藏和通知授权状态。 |
| Barber | 绑定手机号、微信身份、资料、账号状态和平均服务时长。 |
| ServiceLocation | 理发师的历史服务地址、坐标和最近使用时间。 |
| BusinessSession | 一次营业的日期、地址、开关店时间和状态。 |
| QueueBooking | 一次取号行为及其人数。 |
| QueueTicket | 独立号码、位置、状态、通知、过号和顺延时间。 |
| ServiceRecord | 号码对应的理发师、地址、开始和完成时间。 |

所有队列变更必须由服务端原子处理，避免号码冲突、重复开始服务、同时服务多个号码或超过 3 个有效名额。当前 v0.1 原型只模拟这些概念，数据库 schema 仍为空。

