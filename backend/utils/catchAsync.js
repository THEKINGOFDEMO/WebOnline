/**
 * 异步错误处理包装函数
 * @param {Function} fn 需要包装的异步函数
 * @returns {Function} 包装后的异步函数
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}; 