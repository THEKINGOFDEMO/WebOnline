// 转换后端资源URL为前端可访问的URL
export function convertResourceUrl(url) {
  if (!url) return url;
  return url.replace('http://localhost:3000/', 'http://localhost:8080/api/');
}

// 转换多个资源URL
export function convertResourceUrls(obj, fields) {
  if (!obj) return obj;
  const result = { ...obj };
  fields.forEach(field => {
    if (result[field]) {
      result[field] = convertResourceUrl(result[field]);
    }
  });
  return result;
} 