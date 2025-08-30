#!/bin/bash

echo "========================================"
echo "游戏工具 v1.1.0 - GitHub Pages 部署助手"
echo "========================================"
echo
echo "修复内容："
echo "✓ 玩家名称现在可以输入数字"
echo "✓ 添加了 doctorpoker design 浮水印"
echo "✓ 优化了 Split Bon 网格布局"
echo "✓ 修复了显示问题"
echo

echo "正在检查Git是否安装..."
if ! command -v git &> /dev/null; then
    echo "错误：未检测到Git，请先安装Git"
    echo "Ubuntu/Debian: sudo apt-get install git"
    echo "CentOS/RHEL: sudo yum install git"
    echo "macOS: brew install git"
    exit 1
fi

echo "Git已安装，版本："
git --version
echo

read -p "请输入您的GitHub用户名: " github_username
read -p "请输入仓库名称（例如：game-tool）: " repo_name

echo
echo "正在初始化Git仓库..."
git init

echo "正在添加所有文件..."
git add .

echo "正在提交更改..."
git commit -m "v1.1.0 - 修复输入问题，添加浮水印，优化布局"

echo "正在连接到GitHub仓库..."
git remote add origin https://github.com/$github_username/$repo_name.git

echo "正在推送到GitHub..."
git branch -M main
git push -u origin main

echo
echo "========================================"
echo "部署完成！"
echo "========================================"
echo
echo "您的网站地址："
echo "https://$github_username.github.io/$repo_name/"
echo
echo "请按照以下步骤启用GitHub Pages："
echo "1. 访问您的GitHub仓库"
echo "2. 点击 Settings 标签"
echo "3. 左侧菜单找到 Pages"
echo "4. Source选择 'Deploy from a branch'"
echo "5. Branch选择 'main'"
echo "6. 点击 Save"
echo
echo "等待几分钟后，您的朋友就可以通过网址访问了！"
echo
echo "新版本特性："
echo "- 玩家名称支持数字输入"
echo "- 美观的 doctorpoker design 浮水印"
echo "- 更大的网格布局和间距"
echo "- 更好的视觉效果"
echo
read -p "按回车键退出..."

