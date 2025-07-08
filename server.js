const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// 连接MongoDB数据库
mongoose.connect('mongodb://localhost:27017/warehouse', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB连接错误:'));
db.once('open', () => {
  console.log('MongoDB连接成功');
});

// 配置中间件
app.use(cors());
app.use(bodyParser.json());

// 定义商品信息模型
const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  stockIn: { type: Number, default: 0 },
  stockInTime: { type: Date, default: Date.now },
  stockOut: { type: Number, default: 0 },
  stockOutTime: { type: Date }
});

const Product = mongoose.model('Product', productSchema);

// 增: 添加单条商品信息
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 删: 删除单条商品信息
app.delete('/api/products/:productId', async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ productId: req.params.productId });
    if (!deletedProduct) {
      return res.status(404).json({ error: '商品不存在' });
    }
    res.json(deletedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 改: 修改单条商品信息
app.put('/api/products/:productId', async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { productId: req.params.productId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: '商品不存在' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 查: 分页查询所有商品信息
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ stockInTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      page,
      totalPages,
      total,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 汇总统计接口
app.get('/api/products/summary', async (req, res) => {
  try {
    const summary = await Product.aggregate([
      {
        $project: {
          productId: 1,
          name: 1,
          model: 1,
          price: 1,
          inventory: { $subtract: ['$stockIn', '$stockOut'] }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
