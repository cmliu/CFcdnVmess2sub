addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
  })
  
  // 设置优选非TLS地址，不带端口号默认8080
  let addressesnotls = [
    'what.the.fuck.cloudns.biz:2095#Channel t.me/CMLiussss 解锁优选节点',
    'www.visa.com.hk:8880#假装是香港'
  ];

  // 设置优选TLS地址，不带端口号默认8443
  let addresses = [
    'icook.tw:2052#假装是台湾',
  	'cloudflare.cfgo.cc'
  ];

  // 设置优选非TLS地址api接口
  let addressesnotlsapi = [
    'https://raw.githubusercontent.com/cmliu/CFcdnVmess2sub/main/addressesapi.txt', //可参考内容格式 自行搭建。
  	'https://raw.githubusercontent.com/ymyuuu/Proxy-IP-library/main/best-ip.txt'
  ];

  // 设置优选TLS地址api接口
  let addressesapi = [
	  'https://raw.githubusercontent.com/cmliu/WorkerVless2sub/main/addressesapi.txt' //可参考内容格式 自行搭建。
  ];

  let DLS = 4;
  let addressescsv = [
	//'https://raw.githubusercontent.com/cmliu/WorkerVless2sub/main/addressescsv.csv'
  ];
  
  function utf8ToBase64(str) {
	return btoa(unescape(encodeURIComponent(str)));
  }

  async function getAddressesapi() {
	  if (!addressesapi || addressesapi.length === 0) {
		return [];
	  }
	
	  let newAddressesapi = [];
	
	  for (const apiUrl of addressesapi) {
		try {
		  const response = await fetch(apiUrl);
	
		  if (!response.ok) {
			console.error('获取地址时出错:', response.status, response.statusText);
			continue;
		  }
	
		  const text = await response.text();
		  const lines = text.split('\n');
		  const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(#.*)?$/;
	
		  const apiAddresses = lines.map(line => {
			const match = line.match(regex);
			return match ? match[0] : null;
		  }).filter(Boolean);
	
		  newAddressesapi = newAddressesapi.concat(apiAddresses);
		} catch (error) {
		  console.error('获取地址时出错:', error);
		  continue;
		}
	  }
	
	  return newAddressesapi;
  }
  
  async function getAddressescsv() {
	  if (!addressescsv || addressescsv.length === 0) {
		return [];
	  }
	
	  let newAddressescsv = [];
	
	  for (const csvUrl of addressescsv) {
		try {
		  const response = await fetch(csvUrl);
	
		  if (!response.ok) {
			console.error('获取CSV地址时出错:', response.status, response.statusText);
			continue;
		  }
	
		  const text = await response.text();  // 使用正确的字符编码解析文本内容
		  const lines = text.split('\n');
	
		  // 检查CSV头部是否包含必需字段
		  const header = lines[0].split(',');
		  const tlsIndex = header.indexOf('TLS');
		  const speedIndex = header.length - 1; // 最后一个字段
	
		  const ipAddressIndex = 0;  // IP地址在 CSV 头部的位置
		  const portIndex = 1;  // 端口在 CSV 头部的位置
		  const dataCenterIndex = tlsIndex + 1; // 数据中心是 TLS 的后一个字段
	
		  if (tlsIndex === -1) {
			console.error('CSV文件缺少必需的字段');
			continue;
		  }
	
		  // 从第二行开始遍历CSV行
		  for (let i = 1; i < lines.length; i++) {
			const columns = lines[i].split(',');
	
			// 检查TLS是否为"TRUE"且速度大于DLS
			if (columns[tlsIndex] === 'TRUE' && parseFloat(columns[speedIndex]) > DLS) {
			  const ipAddress = columns[ipAddressIndex];
			  const port = columns[portIndex];
			  const dataCenter = columns[dataCenterIndex];
	
			  const formattedAddress = `${ipAddress}:${port}#${dataCenter}`;
			  newAddressescsv.push(formattedAddress);
			}
		  }
		} catch (error) {
		  console.error('获取CSV地址时出错:', error);
		  continue;
		}
	  }
	
	  return newAddressescsv;
  }
  
  async function getAddressesnotlsapi() {
	if (!addressesnotlsapi || addressesnotlsapi.length === 0) {
	  return [];
	}
  
	let newAddressesnotlsapi = [];
  
	for (const apiUrl of addressesnotlsapi) {
	  try {
		const response = await fetch(apiUrl);
  
		if (!response.ok) {
		  console.error('获取地址时出错:', response.status, response.statusText);
		  continue;
		}
  
		const text = await response.text();
		const lines = text.split('\n');
		const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(#.*)?$/;
  
		const apiAddressesnotls = lines.map(line => {
		  const match = line.match(regex);
		  return match ? match[0] : null;
		}).filter(Boolean);
  
		newAddressesnotlsapi = newAddressesnotlsapi.concat(apiAddressesnotls);
	  } catch (error) {
		console.error('获取地址时出错:', error);
		continue;
	  }
	}
  
	return newAddressesnotlsapi;
  }

  async function getAddressesnotlscsv() {
	if (!addressescsv || addressescsv.length === 0) {
	  return [];
	}
  
	let newAddressesnotlscsv = [];
  
	for (const csvUrl of addressescsv) {
	  try {
		const response = await fetch(csvUrl);
  
		if (!response.ok) {
		  console.error('获取CSV地址时出错:', response.status, response.statusText);
		  continue;
		}
  
		const text = await response.text();  // 使用正确的字符编码解析文本内容
		const lines = text.split('\n');
  
		// 检查CSV头部是否包含必需字段
		const header = lines[0].split(',');
		const tlsIndex = header.indexOf('TLS');
		const speedIndex = header.length - 1; // 最后一个字段
  
		const ipAddressIndex = 0;  // IP地址在 CSV 头部的位置
		const portIndex = 1;  // 端口在 CSV 头部的位置
		const dataCenterIndex = tlsIndex + 1; // 数据中心是 TLS 的后一个字段
  
		if (tlsIndex === -1) {
		  console.error('CSV文件缺少必需的字段');
		  continue;
		}
  
		// 从第二行开始遍历CSV行
		for (let i = 1; i < lines.length; i++) {
		  const columns = lines[i].split(',');
  
		  // 检查TLS是否为"FALSE"且速度大于DLS
		  if (columns[tlsIndex] === 'FALSE' && parseFloat(columns[speedIndex]) > DLS) {
			const ipAddress = columns[ipAddressIndex];
			const port = columns[portIndex];
			const dataCenter = columns[dataCenterIndex];
  
			const formattedAddress = `${ipAddress}:${port}#${dataCenter}`;
			newAddressesnotlscsv.push(formattedAddress);
		  }
		}
	  } catch (error) {
		console.error('获取CSV地址时出错:', error);
		continue;
	  }
	}
  
	return newAddressesnotlscsv;
  }

  async function handleRequest(request) {
	const url = new URL(request.url);
	let cc = "";
	let host = "";
	let uuid = "";
	let path = "";
	let alterid = "";
	let security = "";

	if (url.pathname.includes("/auto") || url.pathname.includes("/404") || url.pathname.includes("/sos")) {
		host = "wapv62g.gorun.tech";
		uuid = "57c3bfd6-09d1-4954-9b67-3a7580adc14f";
		path = "/ebffd932-3fb9-460e-dc98-700b592bfb9c";
		alterid = "0";
		security = "auto";
		cc = "HK";
	} else {
		host = url.searchParams.get('host');
		uuid = url.searchParams.get('uuid');
		path = url.searchParams.get('path');
		alterid = url.searchParams.get('alterid');
		security = url.searchParams.get('security');
		cc = url.searchParams.get('cc');
		if (!url.pathname.includes("/sub")) {
			const workerUrl = url.origin + url.pathname;
			const responseText = `
		路径必须包含 "/sub"
		The path must contain "/sub"
		مسیر باید شامل "/sub" باشد
		
		${workerUrl}sub?cc=[vmess name]&host=[your host]&uuid=[your uuid]&path=[your path]
		
		
		
		
		
		
			
			https://github.com/cmliu/CFcdnVmess2sub
			`;
		
			return new Response(responseText, {
			  status: 400,
			  headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		  }
		
		  if (!host || !uuid) {
			const workerUrl = url.origin + url.pathname;
			const responseText = `
		缺少必填参数：host 和 uuid
		Missing required parameters: host and uuid
		پارامترهای ضروری وارد نشده: هاست و یوآی‌دی
		
		${workerUrl}?cc=[vmess name]&host=[your host]&uuid=[your uuid]&path=[your path]
		
		
		
		
		
		
			
			https://github.com/cmliu/CFcdnVmess2sub
			`;
		
			return new Response(responseText, {
			  status: 400,
			  headers: { 'content-type': 'text/plain; charset=utf-8' },
			});
		  }
		
		  if (!path || path.trim() === '') {
			path = '/?ed=2048';
		  } else {
			// 如果第一个字符不是斜杠，则在前面添加一个斜杠
			path = '/' + path;
		  }

		  if (!alterid || alterid.trim() === '') {
			alterid = "0";
		  }

		  if (!security || security.trim() === '') {
			security = "auto";
		  }

		  if (!cc || cc.trim() === '') {
			cc = "US";
		  }
	}
  
	const newAddressesapi = await getAddressesapi();
	const newAddressescsv = await getAddressescsv();
	addresses = addresses.concat(newAddressesapi);
	addresses = addresses.concat(newAddressescsv);
  
	const newAddressesnotlsapi = await getAddressesnotlsapi();
	const newAddressesnotlscsv = await getAddressesnotlscsv();
	addressesnotls = addressesnotls.concat(newAddressesnotlsapi);
	addressesnotls = addressesnotls.concat(newAddressesnotlscsv);

	// 使用Set对象去重
	const uniqueAddresses = [...new Set(addresses)];
	const uniqueAddressesnotls = [...new Set(addressesnotls)];

	const responseBody = uniqueAddresses.map(address => {
	  let port = "8443";
	  let addressid = address;
  
	  if (address.includes(':') && address.includes('#')) {
		const parts = address.split(':');
		address = parts[0];
		const subParts = parts[1].split('#');
		port = subParts[0];
		addressid = subParts[1];
	  } else if (address.includes(':')) {
		const parts = address.split(':');
		address = parts[0];
		port = parts[1];
	  } else if (address.includes('#')) {
		const parts = address.split('#');
		address = parts[0];
		addressid = parts[1];
	  }
  
	  if (addressid.includes(':')) {
		addressid = addressid.split(':')[0];
	  }

	  const vmess = `{
		"v": "2",
		"ps": "${addressid}>${cc}",
		"add": "${address}",
		"port": "${port}",
		"id": "${uuid}",
		"aid": "${alterid}",
		"scy": "${security}",
		"net": "ws",
		"type": "none",
		"host": "${host}",
		"path": "${path}",
		"tls": "tls",
		"sni": "${host}",
		"alpn": "",
		"fp": ""
	  }`;

	  const base64Encoded = utf8ToBase64(vmess);
	  const vmessLink = `vmess://${base64Encoded}`;

	  return vmessLink;
	}).join('\n');
  
	const notlsresponseBody = uniqueAddressesnotls.map(address => {
		let port = "8080";
		let addressid = address;
	
		if (address.includes(':') && address.includes('#')) {
		  const parts = address.split(':');
		  address = parts[0];
		  const subParts = parts[1].split('#');
		  port = subParts[0];
		  addressid = subParts[1];
		} else if (address.includes(':')) {
		  const parts = address.split(':');
		  address = parts[0];
		  port = parts[1];
		} else if (address.includes('#')) {
		  const parts = address.split('#');
		  address = parts[0];
		  addressid = parts[1];
		}
	
		if (addressid.includes(':')) {
		  addressid = addressid.split(':')[0];
		}
  
		const vmess = `{
		  "v": "2",
		  "ps": "${addressid}>${cc}",
		  "add": "${address}",
		  "port": "${port}",
		  "id": "${uuid}",
		  "aid": "${alterid}",
		  "scy": "${security}",
		  "net": "ws",
		  "type": "none",
		  "host": "${host}",
		  "path": "${path}",
		  "tls": "",
		  "sni": "",
		  "alpn": "",
		  "fp": ""
		}`;
  
		const base64Encoded = utf8ToBase64(vmess);
		const vmessLink = `vmess://${base64Encoded}`;
  
		return vmessLink;
	}).join('\n');

	const 汇总 = notlsresponseBody + '\n'+ responseBody ;
	const base64Response = btoa(汇总) ;

	const response = new Response(base64Response, {
	  headers: { 'content-type': 'text/plain' },
	});
  
	return response;
  }
