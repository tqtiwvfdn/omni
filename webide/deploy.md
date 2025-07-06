# 离线YUM包安装操作文档

## 离线RPM包来源

离线RPM包来源于源服务器（10.8.6.173），通过以下命令生成：

```bash
# 在源服务器10.8.6.173执行
yum reinstall $(yum list installed | awk '!/^Loaded|^Installed|^Loading|^Repo|^Upgrading/{print $1}') --downloadonly --downloaddir=offline-packages
tar -czf offline-packages.tar.gz offline-packages/
```

## 目标服务器安装流程（10.8.6.112）

### 步骤1：解压离线包

```bash
tar -xzf offline-packages.tar.gz
cd offline-packages/
```

### 步骤2：执行离线安装

```bash
yum localinstall ./*.rpm -y
```

### 步骤3：验证安装

```bash
echo "安装完成，检查关键服务状态"
git --version
```

---

**核心命令总结**：
1. `tar -xzf offline-packages.tar.gz`
2. `cd offline-packages/`
3. `yum localinstall ./*.rpm -y`