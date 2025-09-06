# 部署到GitHub Pages的步骤

## 方法1：通过GitHub网页界面（推荐）

### 1. 创建GitHub仓库
1. 访问 [GitHub.com](https://github.com) 并登录
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称填写：`game-tool` 或您喜欢的名称
4. 选择 "Public"（公开）
5. 不要勾选 "Add a README file"（我们已经有了）
6. 点击 "Create repository"

### 2. 上传文件
1. 在新建的仓库页面，点击 "uploading an existing file"
2. 将以下文件拖拽到上传区域：
   - `index.html`
   - `script.js`
   - `styles.css`
   - `README.md`
   - `擷取.JPG`（可选）
3. 在 "Commit changes" 部分填写描述，如："Initial commit - 游戏工具"
4. 点击 "Commit changes"

### 3. 启用GitHub Pages
1. 在仓库页面，点击 "Settings" 标签
2. 左侧菜单找到 "Pages"
3. 在 "Source" 部分，选择 "Deploy from a branch"
4. 在 "Branch" 下拉菜单中选择 "main" 或 "master"
5. 点击 "Save"
6. 等待几分钟，GitHub会显示您的网站URL

### 4. 访问您的网站
您的朋友现在可以通过以下网址访问：
```
https://[您的GitHub用户名].github.io/[仓库名]/
```

## 方法2：通过Git命令行

### 1. 初始化Git仓库
```bash
git init
git add .
git commit -m "Initial commit - 游戏工具"
```

### 2. 连接到GitHub
```bash
git remote add origin https://github.com/[您的GitHub用户名]/[仓库名].git
git branch -M main
git push -u origin main
```

### 3. 启用GitHub Pages
按照方法1的步骤3-4操作

## 更新网站

当您修改代码后，需要重新上传：

### 通过网页界面：
1. 在仓库页面点击要修改的文件
2. 点击编辑按钮（铅笔图标）
3. 修改代码后点击 "Commit changes"

### 通过Git命令行：
```bash
git add .
git commit -m "更新说明"
git push
```

## 注意事项

1. **文件大小限制**：GitHub Pages有文件大小限制，单个文件不能超过100MB
2. **更新延迟**：修改后可能需要几分钟才能在网站上看到更新
3. **HTTPS**：GitHub Pages自动提供HTTPS支持
4. **自定义域名**：可以在Settings > Pages中设置自定义域名

## 故障排除

### 网站无法访问
- 检查仓库是否为Public
- 确认GitHub Pages已启用
- 等待几分钟让部署完成

### 样式或功能异常
- 检查浏览器控制台是否有错误
- 确认所有文件都已上传
- 清除浏览器缓存

---

现在您的朋友就可以通过网址访问这个游戏工具了！

