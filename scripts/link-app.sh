#!/usr/bin/env bash
# ============================================================
# gm-antd ↔ 任意消费方 app 本地 link 脚本
#
# 用法(package.json 已挂):
#   yarn link:app [target]      建立 link
#   yarn unlink:app [target]    解除 link
#
# target (消费方目录) 优先级:
#   命令行参数 > 环境变量 LINK_APP > 默认 ../gm_static_x_erp
# target 形式:
#   - 绝对路径:  /Users/.../gm_static_x_mes
#   - 相对路径:  ../gm_static_x_mes
#   - 同级目录名: gm_static_x_mes   (自动按 ../gm_static_x_mes 解析)
#
# 原理: ① 消费方 node_modules/antd → 本地 gm-antd(读 dist); ② gm-antd 的 react/react-dom → 消费方的(消除双 React)
# 详见 docs/2026-06-16-gm-antd-wrapper接入erp兼容修复.md
# ============================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GM_ANTD="$(cd "$SCRIPT_DIR/.." && pwd)"

ACTION="${1:-link}"
# target 解析: 参数 > 环境变量 > 默认
raw_target="${2:-${LINK_APP:-../gm_static_x_erp}}"

if [ -t 1 ]; then
  G='\033[0;32m'; Y='\033[0;33m'; R='\033[0;31m'; C='\033[0;36m'; NC='\033[0m'
else
  G=''; Y=''; R=''; C=''; NC=''
fi
info() { printf "${C}[info]${NC} %s\n" "$*"; }
ok()   { printf "${G}[ok]${NC} %s\n" "$*"; }
warn() { printf "${Y}[warn]${NC} %s\n" "$*"; }
err()  { printf "${R}[err]${NC} %s\n" "$*"; }

# 把 target 归一成绝对路径(同级名 → ../name;相对 → 相对 gm-antd)
case "$raw_target" in
  /*) TARGET="$raw_target" ;;
  ../*|./*) TARGET="$GM_ANTD/$raw_target" ;;
  *) TARGET="$GM_ANTD/../$raw_target" ;;
esac

if [ ! -d "$TARGET/node_modules" ]; then
  err "找不到消费方的 node_modules: $TARGET/node_modules"
  err "用法: yarn link:app <消费方目录>   (同级名 / 相对路径 / 绝对路径)"
  err "示例: yarn link:app gm_static_x_mes"
  err "      yarn link:app ../gm_static_x_erp"
  # 列出同级目录做提示
  info "同级目录候选:"
  ls -d "$GM_ANTD"/../*/ 2>/dev/null | sed 's/^/    /' | head -20
  exit 1
fi
TARGET="$(cd "$TARGET" && pwd)"

# 校验: 消费方要有 react(交叉链接的源)
if [ ! -e "$TARGET/node_modules/react" ]; then
  err "消费方没有 react 依赖: $TARGET/node_modules/react"
  exit 1
fi

info "gm-antd  : $GM_ANTD"
info "消费方   : $TARGET"
echo ""

# 防御: gm-antd/react 已链接到别的消费方 → 提示先 unlink
if [ -L "$GM_ANTD/node_modules/react" ]; then
  cur=$(readlink "$GM_ANTD/node_modules/react")
  if [ "${cur%/node_modules/react}" != "$TARGET" ]; then
    err "gm-antd/react 已链接到别的项目: $cur"
    err "请先对该项目执行  yarn unlink:app <那个项目>  再 link 新的"
    exit 1
  fi
fi

link_one() {
  local linkpath="$1" source="$2" backup="$3"
  if [ -L "$linkpath" ]; then
    warn "已是链接,跳过: $(basename "$linkpath") → $(readlink "$linkpath")"
    return 0
  fi
  if [ ! -e "$source" ]; then err "源不存在,跳过: $source"; return 0; fi
  if [ -e "$linkpath" ]; then
    if [ -e "$backup" ]; then
      rm -rf "$linkpath"; warn "已有备份,删除当前 $(basename "$linkpath")"
    else
      mv "$linkpath" "$backup"; info "备份: $(basename "$linkpath") → $(basename "$backup")"
    fi
  fi
  ln -s "$source" "$linkpath"
  ok "链接: $(basename "$linkpath")  →  $source"
}

unlink_one() {
  local linkpath="$1" source="$2" backup="$3"
  if [ ! -L "$linkpath" ]; then
    warn "不是链接,跳过: $(basename "$linkpath")"; return 0
  fi
  rm "$linkpath"
  if [ -e "$backup" ]; then
    mv "$backup" "$linkpath"; ok "还原: $(basename "$linkpath")  (从备份恢复)"
  else
    warn "已移除链接(无备份): $(basename "$linkpath")"
  fi
}

case "$ACTION" in
  link)
    info "==== 建立 link ===="
    link_one "$TARGET/node_modules/antd"      "$GM_ANTD"                      "$TARGET/node_modules/antd.real.bak"
    link_one "$GM_ANTD/node_modules/react"     "$TARGET/node_modules/react"     "$GM_ANTD/node_modules/react.real.bak"
    link_one "$GM_ANTD/node_modules/react-dom" "$TARGET/node_modules/react-dom" "$GM_ANTD/node_modules/react-dom.real.bak"
    echo ""
    ok "==== link 完成 ===="
    echo ""
    printf "${G}下一步(每次联调都要做):${NC}\n"
    echo "  1. [gm-antd] 起 watch 构建(新终端,保持运行):  yarn build:wrapper:watch"
    printf "  2. [%s] 起开发服务器(若已在跑要先重启,让其重新解析 antd)\n" "$(basename "$TARGET")"
    echo "  3. 若该消费方 webpack 报 'antd module has no exports' 之类缓存腐坏: rm -rf node_modules/.cache 再重启"
    echo ""
    printf "${Y}消费方代码一次性前置(不做则 wrapper 样式/主题/中文不生效):${NC}\n"
    echo "  - import 'antd/dist/index.css'"
    echo "  - <ConfigProvider theme={gmTheme} locale={gmZhCN}>"
    echo ""
    printf "解除: ${C}yarn unlink:app %s${NC}\n" "$(basename "$TARGET")"
    ;;
  unlink)
    info "==== 解除 link(还原 npm 包) ===="
    unlink_one "$TARGET/node_modules/antd"      "$GM_ANTD"                      "$TARGET/node_modules/antd.real.bak"
    unlink_one "$GM_ANTD/node_modules/react"     "$TARGET/node_modules/react"     "$GM_ANTD/node_modules/react.real.bak"
    unlink_one "$GM_ANTD/node_modules/react-dom" "$TARGET/node_modules/react-dom" "$GM_ANTD/node_modules/react-dom.real.bak"
    echo ""
    ok "==== unlink 完成 ===="
    info "记得停掉 gm-antd 的 build:wrapper:watch"
    ;;
  *)
    err "未知动作: $ACTION"
    echo "用法: yarn link:app [target]  |  yarn unlink:app [target]"
    exit 1
    ;;
esac
