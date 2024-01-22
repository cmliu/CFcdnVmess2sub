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
  
  let subconverter = "api.v1.mk"; //在线订阅转换后端，目前使用肥羊的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
  let subconfig = "https://raw.githubusercontent.com/cmliu/edgetunnel/main/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"; //订阅配置文件

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
			if (columns[tlsIndex].toUpperCase() === 'TRUE' && parseFloat(columns[speedIndex]) > DLS) {
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
		  if (columns[tlsIndex].toUpperCase() === 'FALSE' && parseFloat(columns[speedIndex]) > DLS) {
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

  let protocol;
  async function handleRequest(request) {
	const userAgentHeader = request.headers.get('User-Agent');
	const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
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
	} else if (url.pathname.includes("/lunzi")) {
		let sites = [
			{ url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/xray/config.json',type: "xray"},
			{ url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/xray/1/config.json',type: "xray" },
			{ url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/xray/2/config.json',type: "xray"},
			{ url: 'https://raw.githubusercontent.com/Alvin9999/pac2/master/xray/3/config.json',type: "xray"},
			{ url: 'https://gitlab.com/free9999/ipupdate/-/raw/master/xray/config.json',type: "xray"},
			{ url: 'https://gitlab.com/free9999/ipupdate/-/raw/master/xray/2/config.json',type: "xray"},
		];

		const maxRetries = 6;
		let retryCount = 0;
		let data = null;

		while (retryCount < maxRetries) {
		  const randomSite = sites[Math.floor(Math.random() * sites.length)];
		  const response = await fetch(randomSite.url);

			if (response.ok) {
				data = await response.json();
				if (!data) {
					console.error('Failed to fetch data after multiple retries.');
					// 这里你可以选择如何处理失败，比如返回错误响应或执行其他逻辑
					return new Response('Failed to fetch data after multiple retries.', {
					status: 500,
					headers: { 'content-type': 'text/plain; charset=utf-8' },
					});
				}
			
				processXray(data);
			
				function processXray(data) {
					let outboundConfig = data.outbounds[0];
					host = outboundConfig?.streamSettings?.wsSettings?.headers?.Host;
					uuid = outboundConfig.settings?.vnext?.[0]?.users?.[0]?.id;
					path = outboundConfig?.streamSettings?.wsSettings?.path;
					protocol = outboundConfig.protocol;
					cc = "US";
					alterid = outboundConfig.settings?.vnext?.[0]?.users?.[0]?.alterId;
					security = outboundConfig.settings?.vnext?.[0]?.users?.[0]?.security;
				}

				if (protocol.toLowerCase() === 'vmess') {
					break; // 成功获取数据时跳出循环
				}
			} else {
				console.error('Failed to fetch data. Retrying...');
				retryCount++;
			}
		}

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
			path = (path[0] === '/') ? path : '/' + path;
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

	if (userAgent.includes('clash')) {
		const subconverterUrl = `https://${subconverter}/sub?target=clash&url=${encodeURIComponent(request.url)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=false&fdn=false&sort=false&new_name=true`;

		try {
		  const subconverterResponse = await fetch(subconverterUrl);
	  
		  if (!subconverterResponse.ok) {
			throw new Error(`Error fetching subconverterUrl: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
		  }
	  
		  const subconverterContent = await subconverterResponse.text();
	  
		  return new Response(subconverterContent, {
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		  });
		} catch (error) {
		  return new Response(`Error: ${error.message}`, {
			status: 500,
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		  });
		}
	} else if (userAgent.includes('sing-box') || userAgent.includes('singbox')){
		const subconverterUrl = `https://${subconverter}/sub?target=singbox&url=${encodeURIComponent(request.url)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=false&fdn=false&sort=false&new_name=true`;

		try {
		  const subconverterResponse = await fetch(subconverterUrl);
	  
		  if (!subconverterResponse.ok) {
			throw new Error(`Error fetching subconverterUrl: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
		  }
	  
		  const subconverterContent = await subconverterResponse.text();
	  
		  return new Response(subconverterContent, {
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		  });
		} catch (error) {
		  return new Response(`Error: ${error.message}`, {
			status: 500,
			headers: { 'content-type': 'text/plain; charset=utf-8' },
		  });
		}
	} else {

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

  }
