# 2_RESTful_api
#项目概述
使用 MongoDB, 满足简单仓库管理的出库入库功能
商品信息管理：添加和管理商品基本信息（编号、名称、型号、单价）
入库管理：记录商品入库数量和时间，自动更新库存
出库管理：记录商品出库数量和时间，自动更新库存并检查库存充足性
库存查询：查看单个商品详细信息或所有商品列表

MongoDB数据存储结构：
  productId: #商品编号（唯一）
  name: #商品名称
  model: #商品型号
  price: #价格
  stockIn: #入库数量
  stockInTime: #入库时间
  stockOut:#出库数量
  stockOutTime:#出库时间

