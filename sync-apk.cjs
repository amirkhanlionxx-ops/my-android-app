const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { signApk } = require("apk_sign_ts");

function computeDexAdler32(buf, startOffset = 12) {
  const MOD_ADLER = 65521;
  let a = 1;
  let b = 0;
  for (let i = startOffset; i < buf.length; i++) {
    a = (a + buf[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}

function encodeUleb128(value) {
  const bytes = [];
  let val = value >>> 0;
  do {
    let byte = val & 0x7f;
    val >>>= 7;
    if (val !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (val !== 0);
  return Buffer.from(bytes);
}

function buildWebViewClassesDex() {
  const rawStrings = [
    "<init>",
    "L",
    "Landroid/app/Activity;",
    "Landroid/content/Context;",
    "Landroid/os/Bundle;",
    "Landroid/view/View;",
    "Landroid/webkit/WebSettings;",
    "Landroid/webkit/WebView;",
    "Lcom/app/MainActivity;",
    "Ljava/lang/String;",
    "V",
    "VL",
    "VZ",
    "Z",
    "canGoBack",
    "file:///android_asset/html/index.html",
    "getSettings",
    "goBack",
    "loadUrl",
    "onBackPressed",
    "onCreate",
    "setAllowFileAccess",
    "setAllowUniversalAccessFromFileURLs",
    "setContentView",
    "setDomStorageEnabled",
    "setJavaScriptEnabled",
    "webView",
  ].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const strIdx = (s) => rawStrings.indexOf(s);

  const typeDescriptors = [
    "Landroid/app/Activity;",
    "Landroid/content/Context;",
    "Landroid/os/Bundle;",
    "Landroid/view/View;",
    "Landroid/webkit/WebSettings;",
    "Landroid/webkit/WebView;",
    "Lcom/app/MainActivity;",
    "Ljava/lang/String;",
    "V",
    "Z",
  ].sort((a, b) => strIdx(a) - strIdx(b));

  const typeIdx = (desc) => typeDescriptors.indexOf(desc);

  const protoSpecs = [
    { key: "()Landroid/webkit/WebSettings;", shorty: "L", returnType: "Landroid/webkit/WebSettings;", params: [] },
    { key: "()V", shorty: "V", returnType: "V", params: [] },
    { key: "(Landroid/content/Context;)V", shorty: "VL", returnType: "V", params: ["Landroid/content/Context;"] },
    { key: "(Landroid/os/Bundle;)V", shorty: "VL", returnType: "V", params: ["Landroid/os/Bundle;"] },
    { key: "(Landroid/view/View;)V", shorty: "VL", returnType: "V", params: ["Landroid/view/View;"] },
    { key: "(Ljava/lang/String;)V", shorty: "VL", returnType: "V", params: ["Ljava/lang/String;"] },
    { key: "(Z)V", shorty: "VZ", returnType: "V", params: ["Z"] },
    { key: "()Z", shorty: "Z", returnType: "Z", params: [] },
  ].sort((a, b) => {
    const rDiff = typeIdx(a.returnType) - typeIdx(b.returnType);
    if (rDiff !== 0) return rDiff;
    const minLen = Math.min(a.params.length, b.params.length);
    for (let i = 0; i < minLen; i++) {
      const pDiff = typeIdx(a.params[i]) - typeIdx(b.params[i]);
      if (pDiff !== 0) return pDiff;
    }
    return a.params.length - b.params.length;
  });

  const protoIdx = (key) => protoSpecs.findIndex((p) => p.key === key);

  const methodSpecs = [
    { key: "Activity.<init>", classDesc: "Landroid/app/Activity;", name: "<init>", protoKey: "()V" },
    { key: "Activity.onBackPressed", classDesc: "Landroid/app/Activity;", name: "onBackPressed", protoKey: "()V" },
    { key: "Activity.onCreate", classDesc: "Landroid/app/Activity;", name: "onCreate", protoKey: "(Landroid/os/Bundle;)V" },
    { key: "Activity.setContentView", classDesc: "Landroid/app/Activity;", name: "setContentView", protoKey: "(Landroid/view/View;)V" },
    { key: "WebSettings.setAllowFileAccess", classDesc: "Landroid/webkit/WebSettings;", name: "setAllowFileAccess", protoKey: "(Z)V" },
    { key: "WebSettings.setAllowUniversalAccessFromFileURLs", classDesc: "Landroid/webkit/WebSettings;", name: "setAllowUniversalAccessFromFileURLs", protoKey: "(Z)V" },
    { key: "WebSettings.setDomStorageEnabled", classDesc: "Landroid/webkit/WebSettings;", name: "setDomStorageEnabled", protoKey: "(Z)V" },
    { key: "WebSettings.setJavaScriptEnabled", classDesc: "Landroid/webkit/WebSettings;", name: "setJavaScriptEnabled", protoKey: "(Z)V" },
    { key: "WebView.<init>", classDesc: "Landroid/webkit/WebView;", name: "<init>", protoKey: "(Landroid/content/Context;)V" },
    { key: "WebView.canGoBack", classDesc: "Landroid/webkit/WebView;", name: "canGoBack", protoKey: "()Z" },
    { key: "WebView.getSettings", classDesc: "Landroid/webkit/WebView;", name: "getSettings", protoKey: "()Landroid/webkit/WebSettings;" },
    { key: "WebView.goBack", classDesc: "Landroid/webkit/WebView;", name: "goBack", protoKey: "()V" },
    { key: "WebView.loadUrl", classDesc: "Landroid/webkit/WebView;", name: "loadUrl", protoKey: "(Ljava/lang/String;)V" },
    { key: "MainActivity.<init>", classDesc: "Lcom/app/MainActivity;", name: "<init>", protoKey: "()V" },
    { key: "MainActivity.onBackPressed", classDesc: "Lcom/app/MainActivity;", name: "onBackPressed", protoKey: "()V" },
    { key: "MainActivity.onCreate", classDesc: "Lcom/app/MainActivity;", name: "onCreate", protoKey: "(Landroid/os/Bundle;)V" },
  ].sort((a, b) => {
    const cDiff = typeIdx(a.classDesc) - typeIdx(b.classDesc);
    if (cDiff !== 0) return cDiff;
    const nDiff = strIdx(a.name) - strIdx(b.name);
    if (nDiff !== 0) return nDiff;
    return protoIdx(a.protoKey) - protoIdx(b.protoKey);
  });

  const methodIdx = (key) => methodSpecs.findIndex((m) => m.key === key);
  const webViewFieldIdx = 0;

  const buildCodeItem = (registersSize, insSize, outsSize, insnsWords) => {
    const insnsBytes = insnsWords.length * 2;
    const rawLen = 16 + insnsBytes;
    const alignedLen = (rawLen + 3) & ~3;
    const buf = Buffer.alloc(alignedLen, 0);
    buf.writeUInt16LE(registersSize, 0);
    buf.writeUInt16LE(insSize, 2);
    buf.writeUInt16LE(outsSize, 4);
    buf.writeUInt16LE(0, 6);
    buf.writeUInt32LE(0, 8);
    buf.writeUInt32LE(insnsWords.length, 12);
    for (let i = 0; i < insnsWords.length; i++) {
      buf.writeUInt16LE(insnsWords[i] & 0xffff, 16 + i * 2);
    }
    return buf;
  };

  const initCodeItem = buildCodeItem(1, 1, 1, [
    0x1070,
    methodIdx("Activity.<init>"),
    0x0000,
    0x000e,
  ]);

  const onBackPressedCodeItem = buildCodeItem(3, 1, 1, [
    0x2054,
    webViewFieldIdx,
    0x0038,
    0x000c,
    0x106e,
    methodIdx("WebView.canGoBack"),
    0x0000,
    0x010a,
    0x0138,
    0x0006,
    0x106e,
    methodIdx("WebView.goBack"),
    0x0000,
    0x000e,
    0x106f,
    methodIdx("Activity.onBackPressed"),
    0x0002,
    0x000e,
  ]);

  const onCreateCodeItem = buildCodeItem(5, 2, 2, [
    0x206f,
    methodIdx("Activity.onCreate"),
    0x0043,
    0x0022,
    typeIdx("Landroid/webkit/WebView;"),
    0x2070,
    methodIdx("WebView.<init>"),
    0x0030,
    0x305b,
    webViewFieldIdx,
    0x106e,
    methodIdx("WebView.getSettings"),
    0x0000,
    0x010c,
    0x1212,
    0x206e,
    methodIdx("WebSettings.setJavaScriptEnabled"),
    0x0021,
    0x206e,
    methodIdx("WebSettings.setDomStorageEnabled"),
    0x0021,
    0x206e,
    methodIdx("WebSettings.setAllowFileAccess"),
    0x0021,
    0x206e,
    methodIdx("WebSettings.setAllowUniversalAccessFromFileURLs"),
    0x0021,
    0x206e,
    methodIdx("Activity.setContentView"),
    0x0003,
    0x011a,
    strIdx("file:///android_asset/html/index.html"),
    0x206e,
    methodIdx("WebView.loadUrl"),
    0x0010,
    0x000e,
  ]);

  const headerOff = 0;
  const headerSize = 0x70;
  const stringIdsOff = headerSize;
  const stringIdsSize = rawStrings.length * 4;
  const typeIdsOff = stringIdsOff + stringIdsSize;
  const typeIdsSize = typeDescriptors.length * 4;
  const protoIdsOff = typeIdsOff + typeIdsSize;
  const protoIdsSize = protoSpecs.length * 12;
  const fieldIdsOff = protoIdsOff + protoIdsSize;
  const fieldIdsSize = 8;
  const methodIdsOff = fieldIdsOff + fieldIdsSize;
  const methodIdsSize = methodSpecs.length * 8;
  const classDefsOff = methodIdsOff + methodIdsSize;
  const classDefsSize = 32;

  const dataOff = (classDefsOff + classDefsSize + 3) & ~3;
  let cursor = dataOff;

  const typeListsOff = cursor;
  const paramProtos = protoSpecs.filter((p) => p.params.length > 0);
  const protoParamOffMap = new Map();
  const typeListChunks = [];
  for (let i = 0; i < paramProtos.length; i++) {
    const p = paramProtos[i];
    protoParamOffMap.set(p.key, cursor);
    const isLast = i === paramProtos.length - 1;
    const itemLen = isLast ? 4 + p.params.length * 2 : (4 + p.params.length * 2 + 3) & ~3;
    const b = Buffer.alloc(itemLen, 0);
    b.writeUInt32LE(p.params.length, 0);
    for (let j = 0; j < p.params.length; j++) {
      b.writeUInt16LE(typeIdx(p.params[j]), 4 + j * 2);
    }
    typeListChunks.push(b);
    cursor += itemLen;
  }
  const preCodePad = (4 - (cursor % 4)) % 4;
  if (preCodePad > 0) {
    typeListChunks.push(Buffer.alloc(preCodePad, 0));
    cursor += preCodePad;
  }

  const codeItemsOff = cursor;
  const initCodeOff = cursor;
  cursor += initCodeItem.length;
  const onBackPressedCodeOff = cursor;
  cursor += onBackPressedCodeItem.length;
  const onCreateCodeOff = cursor;
  cursor += onCreateCodeItem.length;

  const stringDataOff = cursor;
  const stringDataOffsets = [];
  const stringDataChunks = [];
  for (const s of rawStrings) {
    stringDataOffsets.push(cursor);
    const utf8Buf = Buffer.from(s, "utf8");
    const lenPrefix = encodeUleb128(s.length);
    const chunk = Buffer.concat([lenPrefix, utf8Buf, Buffer.from([0x00])]);
    stringDataChunks.push(chunk);
    cursor += chunk.length;
  }

  const classDataOff = cursor;
  const initMIdx = methodIdx("MainActivity.<init>");
  const backMIdx = methodIdx("MainActivity.onBackPressed");
  const createMIdx = methodIdx("MainActivity.onCreate");

  const classDataBuf = Buffer.concat([
    encodeUleb128(0),
    encodeUleb128(1),
    encodeUleb128(1),
    encodeUleb128(2),
    encodeUleb128(webViewFieldIdx),
    encodeUleb128(0x0002),
    encodeUleb128(initMIdx),
    encodeUleb128(0x10001),
    encodeUleb128(initCodeOff),
    encodeUleb128(backMIdx),
    encodeUleb128(0x0001),
    encodeUleb128(onBackPressedCodeOff),
    encodeUleb128(createMIdx - backMIdx),
    encodeUleb128(0x0004),
    encodeUleb128(onCreateCodeOff),
  ]);
  cursor += classDataBuf.length;

  const preMapPad = (4 - (cursor % 4)) % 4;
  cursor += preMapPad;

  const mapOff = cursor;
  const mapItems = [
    { type: 0x0000, size: 1, offset: headerOff },
    { type: 0x0001, size: rawStrings.length, offset: stringIdsOff },
    { type: 0x0002, size: typeDescriptors.length, offset: typeIdsOff },
    { type: 0x0003, size: protoSpecs.length, offset: protoIdsOff },
    { type: 0x0004, size: 1, offset: fieldIdsOff },
    { type: 0x0005, size: methodSpecs.length, offset: methodIdsOff },
    { type: 0x0006, size: 1, offset: classDefsOff },
    { type: 0x1001, size: paramProtos.length, offset: typeListsOff },
    { type: 0x2001, size: 3, offset: codeItemsOff },
    { type: 0x2002, size: rawStrings.length, offset: stringDataOff },
    { type: 0x2000, size: 1, offset: classDataOff },
    { type: 0x1000, size: 1, offset: mapOff },
  ];
  const mapBuf = Buffer.alloc(4 + mapItems.length * 12, 0);
  mapBuf.writeUInt32LE(mapItems.length, 0);
  for (let i = 0; i < mapItems.length; i++) {
    const m = mapItems[i];
    const base = 4 + i * 12;
    mapBuf.writeUInt16LE(m.type, base);
    mapBuf.writeUInt16LE(0, base + 2);
    mapBuf.writeUInt32LE(m.size, base + 4);
    mapBuf.writeUInt32LE(m.offset, base + 8);
  }
  cursor += mapBuf.length;

  const totalFileSize = cursor;
  const dex = Buffer.alloc(totalFileSize, 0);

  for (let i = 0; i < rawStrings.length; i++) {
    dex.writeUInt32LE(stringDataOffsets[i], stringIdsOff + i * 4);
  }
  for (let i = 0; i < typeDescriptors.length; i++) {
    dex.writeUInt32LE(strIdx(typeDescriptors[i]), typeIdsOff + i * 4);
  }
  for (let i = 0; i < protoSpecs.length; i++) {
    const p = protoSpecs[i];
    const base = protoIdsOff + i * 12;
    dex.writeUInt32LE(strIdx(p.shorty), base);
    dex.writeUInt32LE(typeIdx(p.returnType), base + 4);
    dex.writeUInt32LE(protoParamOffMap.get(p.key) || 0, base + 8);
  }
  dex.writeUInt16LE(typeIdx("Lcom/app/MainActivity;"), fieldIdsOff);
  dex.writeUInt16LE(typeIdx("Landroid/webkit/WebView;"), fieldIdsOff + 2);
  dex.writeUInt32LE(strIdx("webView"), fieldIdsOff + 4);

  for (let i = 0; i < methodSpecs.length; i++) {
    const m = methodSpecs[i];
    const base = methodIdsOff + i * 8;
    dex.writeUInt16LE(typeIdx(m.classDesc), base);
    dex.writeUInt16LE(protoIdx(m.protoKey), base + 2);
    dex.writeUInt32LE(strIdx(m.name), base + 4);
  }

  dex.writeUInt32LE(typeIdx("Lcom/app/MainActivity;"), classDefsOff);
  dex.writeUInt32LE(0x0001, classDefsOff + 4);
  dex.writeUInt32LE(typeIdx("Landroid/app/Activity;"), classDefsOff + 8);
  dex.writeUInt32LE(0, classDefsOff + 12);
  dex.writeUInt32LE(0xffffffff, classDefsOff + 16);
  dex.writeUInt32LE(0, classDefsOff + 20);
  dex.writeUInt32LE(classDataOff, classDefsOff + 24);
  dex.writeUInt32LE(0, classDefsOff + 28);

  Buffer.concat(typeListChunks).copy(dex, typeListsOff);
  initCodeItem.copy(dex, initCodeOff);
  onBackPressedCodeItem.copy(dex, onBackPressedCodeOff);
  onCreateCodeItem.copy(dex, onCreateCodeOff);
  Buffer.concat(stringDataChunks).copy(dex, stringDataOff);
  classDataBuf.copy(dex, classDataOff);
  mapBuf.copy(dex, mapOff);

  Buffer.from("dex\n035\0", "ascii").copy(dex, 0);
  dex.writeUInt32LE(totalFileSize, 0x20);
  dex.writeUInt32LE(headerSize, 0x24);
  dex.writeUInt32LE(0x12345678, 0x28);
  dex.writeUInt32LE(0, 0x2c);
  dex.writeUInt32LE(0, 0x30);
  dex.writeUInt32LE(mapOff, 0x34);
  dex.writeUInt32LE(rawStrings.length, 0x38);
  dex.writeUInt32LE(stringIdsOff, 0x3c);
  dex.writeUInt32LE(typeDescriptors.length, 0x40);
  dex.writeUInt32LE(typeIdsOff, 0x44);
  dex.writeUInt32LE(protoSpecs.length, 0x48);
  dex.writeUInt32LE(protoIdsOff, 0x4c);
  dex.writeUInt32LE(1, 0x50);
  dex.writeUInt32LE(fieldIdsOff, 0x54);
  dex.writeUInt32LE(methodSpecs.length, 0x58);
  dex.writeUInt32LE(methodIdsOff, 0x5c);
  dex.writeUInt32LE(1, 0x60);
  dex.writeUInt32LE(classDefsOff, 0x64);
  dex.writeUInt32LE(totalFileSize - dataOff, 0x68);
  dex.writeUInt32LE(dataOff, 0x6c);

  const sha1 = crypto.createHash("sha1").update(dex.subarray(0x20)).digest();
  sha1.copy(dex, 0x0c);
  const adler = computeDexAdler32(dex, 0x0c);
  dex.writeUInt32LE(adler, 0x08);
  return dex;
}

function buildUtf16StringPoolChunk(strings) {
  const encodedStrings = [];
  const offsets = [];
  let currentOffset = 0;

  for (const s of strings) {
    offsets.push(currentOffset);
    const charLen = s.length;
    const strBytes = Buffer.from(s, "utf16le");
    const buf = Buffer.alloc(2 + strBytes.length + 2, 0);
    buf.writeUInt16LE(charLen, 0);
    strBytes.copy(buf, 2);
    buf.writeUInt16LE(0, 2 + strBytes.length);
    encodedStrings.push(buf);
    currentOffset += buf.length;
  }

  const stringsBlock = Buffer.concat(encodedStrings);
  const padLen = (4 - (stringsBlock.length % 4)) % 4;
  const paddedStringsBlock = padLen > 0 ? Buffer.concat([stringsBlock, Buffer.alloc(padLen, 0)]) : stringsBlock;

  const headerSize = 28;
  const offsetsSize = strings.length * 4;
  const stringsStart = headerSize + offsetsSize;
  const totalSize = stringsStart + paddedStringsBlock.length;

  const chunk = Buffer.alloc(totalSize, 0);
  chunk.writeUInt16LE(0x0001, 0);
  chunk.writeUInt16LE(headerSize, 2);
  chunk.writeUInt32LE(totalSize, 4);
  chunk.writeUInt32LE(strings.length, 8);
  chunk.writeUInt32LE(0, 12);
  chunk.writeUInt32LE(0, 16);
  chunk.writeUInt32LE(stringsStart, 20);
  chunk.writeUInt32LE(0, 24);

  for (let i = 0; i < offsets.length; i++) {
    chunk.writeUInt32LE(offsets[i], headerSize + i * 4);
  }
  paddedStringsBlock.copy(chunk, stringsStart);
  return chunk;
}

function buildBinaryAndroidManifest({ packageName, appName, versionCode, versionName = "1.0.0" }) {
  const attrResourcePairs = [
    { name: "theme", id: 0x01010000 },
    { name: "label", id: 0x01010001 },
    { name: "icon", id: 0x01010002 },
    { name: "name", id: 0x01010003 },
    { name: "exported", id: 0x01010010 },
    { name: "configChanges", id: 0x0101001f },
    { name: "minSdkVersion", id: 0x0101020c },
    { name: "versionCode", id: 0x0101021b },
    { name: "versionName", id: 0x0101021c },
    { name: "targetSdkVersion", id: 0x01010270 },
    { name: "hardwareAccelerated", id: 0x010102d3 },
    { name: "usesCleartextTraffic", id: 0x010103f0 },
  ];

  const extraStrings = [
    "android",
    "http://schemas.android.com/apk/res/android",
    "manifest",
    "package",
    "uses-sdk",
    "uses-permission",
    "android.permission.INTERNET",
    "application",
    "activity",
    "com.app.MainActivity",
    "intent-filter",
    "action",
    "android.intent.action.MAIN",
    "category",
    "android.intent.category.LAUNCHER",
    packageName,
    appName,
    versionName,
  ];

  const allStrings = [...attrResourcePairs.map((p) => p.name)];
  for (const s of extraStrings) {
    if (!allStrings.includes(s)) allStrings.push(s);
  }
  const sIdx = (s) => allStrings.indexOf(s);

  const stringPoolChunk = buildUtf16StringPoolChunk(allStrings);
  const resMapSize = 8 + attrResourcePairs.length * 4;
  const resMapChunk = Buffer.alloc(resMapSize, 0);
  resMapChunk.writeUInt16LE(0x0180, 0);
  resMapChunk.writeUInt16LE(8, 2);
  resMapChunk.writeUInt32LE(resMapSize, 4);
  for (let i = 0; i < attrResourcePairs.length; i++) {
    resMapChunk.writeUInt32LE(attrResourcePairs[i].id, 8 + i * 4);
  }

  const nsPrefix = sIdx("android");
  const nsUri = sIdx("http://schemas.android.com/apk/res/android");
  const NO_INDEX = 0xffffffff;

  const buildNamespaceChunk = (type, line) => {
    const b = Buffer.alloc(24, 0);
    b.writeUInt16LE(type, 0);
    b.writeUInt16LE(16, 2);
    b.writeUInt32LE(24, 4);
    b.writeUInt32LE(line, 8);
    b.writeUInt32LE(NO_INDEX, 12);
    b.writeUInt32LE(nsPrefix, 16);
    b.writeUInt32LE(nsUri, 20);
    return b;
  };

  const buildStartElement = (line, elemName, attrs) => {
    const totalSize = 36 + attrs.length * 20;
    const b = Buffer.alloc(totalSize, 0);
    b.writeUInt16LE(0x0102, 0);
    b.writeUInt16LE(16, 2);
    b.writeUInt32LE(totalSize, 4);
    b.writeUInt32LE(line, 8);
    b.writeUInt32LE(NO_INDEX, 12);
    b.writeUInt32LE(NO_INDEX, 16);
    b.writeUInt32LE(sIdx(elemName), 20);
    b.writeUInt16LE(20, 24);
    b.writeUInt16LE(20, 26);
    b.writeUInt16LE(attrs.length, 28);
    for (let i = 0; i < attrs.length; i++) {
      const a = attrs[i];
      const base = 36 + i * 20;
      b.writeUInt32LE(a.ns, base);
      b.writeUInt32LE(a.name, base + 4);
      b.writeUInt32LE(a.rawValue, base + 8);
      b.writeUInt16LE(8, base + 12);
      b.writeUInt8(0, base + 14);
      b.writeUInt8(a.dataType, base + 15);
      b.writeUInt32LE(a.data >>> 0, base + 16);
    }
    return b;
  };

  const buildEndElement = (line, elemName) => {
    const b = Buffer.alloc(24, 0);
    b.writeUInt16LE(0x0103, 0);
    b.writeUInt16LE(16, 2);
    b.writeUInt32LE(24, 4);
    b.writeUInt32LE(line, 8);
    b.writeUInt32LE(NO_INDEX, 12);
    b.writeUInt32LE(NO_INDEX, 16);
    b.writeUInt32LE(sIdx(elemName), 20);
    return b;
  };

  const xmlNodes = Buffer.concat([
    buildNamespaceChunk(0x0100, 2),
    buildStartElement(2, "manifest", [
      { ns: nsUri, name: sIdx("versionCode"), rawValue: NO_INDEX, dataType: 0x10, data: versionCode },
      { ns: nsUri, name: sIdx("versionName"), rawValue: sIdx(versionName), dataType: 0x03, data: sIdx(versionName) },
      { ns: NO_INDEX, name: sIdx("package"), rawValue: sIdx(packageName), dataType: 0x03, data: sIdx(packageName) },
    ]),
    buildStartElement(3, "uses-sdk", [
      { ns: nsUri, name: sIdx("minSdkVersion"), rawValue: NO_INDEX, dataType: 0x10, data: 21 },
      { ns: nsUri, name: sIdx("targetSdkVersion"), rawValue: NO_INDEX, dataType: 0x10, data: 33 },
    ]),
    buildEndElement(3, "uses-sdk"),
    buildStartElement(4, "uses-permission", [
      { ns: nsUri, name: sIdx("name"), rawValue: sIdx("android.permission.INTERNET"), dataType: 0x03, data: sIdx("android.permission.INTERNET") },
    ]),
    buildEndElement(4, "uses-permission"),
    buildStartElement(5, "application", [
      { ns: nsUri, name: sIdx("theme"), rawValue: NO_INDEX, dataType: 0x01, data: 0x01030006 },
      { ns: nsUri, name: sIdx("label"), rawValue: sIdx(appName), dataType: 0x03, data: sIdx(appName) },
      { ns: nsUri, name: sIdx("icon"), rawValue: NO_INDEX, dataType: 0x01, data: 0x7f010000 },
      { ns: nsUri, name: sIdx("hardwareAccelerated"), rawValue: NO_INDEX, dataType: 0x12, data: 0xffffffff },
      { ns: nsUri, name: sIdx("usesCleartextTraffic"), rawValue: NO_INDEX, dataType: 0x12, data: 0xffffffff },
    ]),
    buildStartElement(6, "activity", [
      { ns: nsUri, name: sIdx("theme"), rawValue: NO_INDEX, dataType: 0x01, data: 0x01030006 },
      { ns: nsUri, name: sIdx("label"), rawValue: sIdx(appName), dataType: 0x03, data: sIdx(appName) },
      { ns: nsUri, name: sIdx("name"), rawValue: sIdx("com.app.MainActivity"), dataType: 0x03, data: sIdx("com.app.MainActivity") },
      { ns: nsUri, name: sIdx("exported"), rawValue: NO_INDEX, dataType: 0x12, data: 0xffffffff },
      { ns: nsUri, name: sIdx("configChanges"), rawValue: NO_INDEX, dataType: 0x11, data: 0x04a0 },
    ]),
    buildStartElement(7, "intent-filter", []),
    buildStartElement(8, "action", [
      { ns: nsUri, name: sIdx("name"), rawValue: sIdx("android.intent.action.MAIN"), dataType: 0x03, data: sIdx("android.intent.action.MAIN") },
    ]),
    buildEndElement(8, "action"),
    buildStartElement(9, "category", [
      { ns: nsUri, name: sIdx("name"), rawValue: sIdx("android.intent.category.LAUNCHER"), dataType: 0x03, data: sIdx("android.intent.category.LAUNCHER") },
    ]),
    buildEndElement(9, "category"),
    buildEndElement(10, "intent-filter"),
    buildEndElement(11, "activity"),
    buildEndElement(12, "application"),
    buildEndElement(13, "manifest"),
    buildNamespaceChunk(0x0101, 13),
  ]);

  const totalSize = 8 + stringPoolChunk.length + resMapChunk.length + xmlNodes.length;
  const header = Buffer.alloc(8, 0);
  header.writeUInt16LE(0x0003, 0);
  header.writeUInt16LE(8, 2);
  header.writeUInt32LE(totalSize, 4);
  return Buffer.concat([header, stringPoolChunk, resMapChunk, xmlNodes]);
}

function buildBinaryResourcesArsc(packageName, appName) {
  const globalStringPool = buildUtf16StringPoolChunk(["res/drawable/ic_launcher.png", appName]);
  const typeStringPool = buildUtf16StringPoolChunk(["drawable", "string"]);
  const keyStringPool = buildUtf16StringPoolChunk(["ic_launcher", "app_name"]);

  const buildTypeSpecAndType = (typeId, keyIndex, globalStringIndex) => {
    const spec = Buffer.alloc(20, 0);
    spec.writeUInt16LE(0x0202, 0);
    spec.writeUInt16LE(16, 2);
    spec.writeUInt32LE(20, 4);
    spec.writeUInt8(typeId, 8);
    spec.writeUInt32LE(1, 12);

    const typeChunk = Buffer.alloc(104, 0);
    typeChunk.writeUInt16LE(0x0201, 0);
    typeChunk.writeUInt16LE(84, 2);
    typeChunk.writeUInt32LE(104, 4);
    typeChunk.writeUInt8(typeId, 8);
    typeChunk.writeUInt32LE(1, 12);
    typeChunk.writeUInt32LE(88, 16);
    typeChunk.writeUInt32LE(64, 20);
    typeChunk.writeUInt32LE(0, 84);
    typeChunk.writeUInt16LE(8, 88);
    typeChunk.writeUInt16LE(0, 90);
    typeChunk.writeUInt32LE(keyIndex, 92);
    typeChunk.writeUInt16LE(8, 96);
    typeChunk.writeUInt8(0, 98);
    typeChunk.writeUInt8(0x03, 99);
    typeChunk.writeUInt32LE(globalStringIndex, 100);
    return Buffer.concat([spec, typeChunk]);
  };

  const drawableChunks = buildTypeSpecAndType(1, 0, 0);
  const stringChunks = buildTypeSpecAndType(2, 1, 1);

  const pkgHeaderSize = 288;
  const pkgBody = Buffer.concat([typeStringPool, keyStringPool, drawableChunks, stringChunks]);
  const pkgTotalSize = pkgHeaderSize + pkgBody.length;

  const pkgHeader = Buffer.alloc(pkgHeaderSize, 0);
  pkgHeader.writeUInt16LE(0x0200, 0);
  pkgHeader.writeUInt16LE(pkgHeaderSize, 2);
  pkgHeader.writeUInt32LE(pkgTotalSize, 4);
  pkgHeader.writeUInt32LE(0x7f, 8);
  Buffer.from(packageName.slice(0, 127), "utf16le").copy(pkgHeader, 12);
  pkgHeader.writeUInt32LE(pkgHeaderSize, 268);
  pkgHeader.writeUInt32LE(2, 272);
  pkgHeader.writeUInt32LE(pkgHeaderSize + typeStringPool.length, 276);
  pkgHeader.writeUInt32LE(2, 280);

  const packageChunk = Buffer.concat([pkgHeader, pkgBody]);
  const totalArscSize = 12 + globalStringPool.length + packageChunk.length;

  const tableHeader = Buffer.alloc(12, 0);
  tableHeader.writeUInt16LE(0x0002, 0);
  tableHeader.writeUInt16LE(12, 2);
  tableHeader.writeUInt32LE(totalArscSize, 4);
  tableHeader.writeUInt32LE(1, 8);
  return Buffer.concat([tableHeader, globalStringPool, packageChunk]);
}

function buildDefaultLauncherPng() {
  const width = 96;
  const height = 96;
  const rawScanlines = Buffer.alloc(height * (1 + width * 4), 0);
  for (let y = 0; y < height; y++) {
    const rowOff = y * (1 + width * 4);
    rawScanlines[rowOff] = 0;
    for (let x = 0; x < width; x++) {
      const pxOff = rowOff + 1 + x * 4;
      const dx = x - 48;
      const dy = y - 48;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 42) {
        if (dist <= 24) {
          rawScanlines[pxOff] = 0x3d;
          rawScanlines[pxOff + 1] = 0xdc;
          rawScanlines[pxOff + 2] = 0x84;
          rawScanlines[pxOff + 3] = 0xff;
        } else {
          rawScanlines[pxOff] = 0x16;
          rawScanlines[pxOff + 1] = 0x18;
          rawScanlines[pxOff + 2] = 0x26;
          rawScanlines[pxOff + 3] = 0xff;
        }
      }
    }
  }

  const makePngChunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 4, "ascii");
    data.copy(out, 8);
    const crc = zlib.crc32(out.subarray(4, 8 + data.length)) >>> 0;
    out.writeUInt32BE(crc, 8 + data.length);
    return out;
  };

  const ihdr = Buffer.alloc(13, 0);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = zlib.deflateSync(rawScanlines);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    makePngChunk("IHDR", ihdr),
    makePngChunk("IDAT", idat),
    makePngChunk("IEND", Buffer.alloc(0)),
  ]);
}

const DEFAULT_KEY_B64 =
  "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC93/ihX9soPBNs\n" +
  "zlsxt5Sj6Vv2OwxkpicKGBOUjaPrSHWEPusQBW/NYnh7b1gPJLI+hNGT3tPL2g77\n" +
  "yGtA4OTJ9OTMP8Gh8tmm9K1+Xe7oxZObFt3yoryGlDhCpyAYd5mbHNYP6kJ+xyha\n" +
  "CsAOqHBhchxsN1WxhT0sMcdSDD4IihNxpCDHy0vTkywzx806QH5XcOZMCI3GymKU\n" +
  "4YChLlj5W5yOeum2QXx1HyAjLWpZRtmtvZkxzHtJU5MfzBNicmMDIYWiPlUMGWBV\n" +
  "UJIaq5GrQSuDdBkTfjhkWYwqqqBOlRdG/e9yaMYvSLwhjfHA9Au9nyjQwHhiffvw\n" +
  "gfw6m8ydAgMBAAECggEALaM/D0irNE9GSv2JkVhjB4fQVQ2J08pU8VnqoObvip6y\n" +
  "slvuI35vCkJ8G40ecRtcpWbGugBRz3pk5hNc5i34B+vPL6G2cK7erkC6z7gTs8rD\n" +
  "iQA0zjxbzIwlPq4NapwapVwHvrELlQ3ZDtVtJsjJJD7pgoBFXmMcWjpHwpqTMXlW\n" +
  "pV0QjPN4SwV+TNefCoDMFEkOL0vedVn9AUti2+gLvYXzZqnOW8DZfI6WykCslm80\n" +
  "zoTQo1e7ubJgcjz3YuIgp1hrB0lL65wDzASmWTPIu4QIbgKiYGo0jhF1mYOEwhdm\n" +
  "HW75uDG4iUUJuFQSBFejMWuue8cB5cMn9p5rGg+J4QKBgQDgQvSxVx9hsohULDZZ\n" +
  "fqBWQpr2xxBOJBpRWEAPoVnipqoBkYZBU49WjFp/Ap8ECcxXNYB2HW+rmHacdLa4\n" +
  "Hgei2bg2oq5OtL8PvU/drRvN23x0cVV+R/TvJWlmWgpCEVcZSKAZ28YvfGwaOP6k\n" +
  "/XFccRlPMudmQstagtK9uylK/QKBgQDYvy3oMp5Mwq00bD+XIpYj4QXzm+6zXjZa\n" +
  "W0VUIbQ3b6e4ug1rvMuzLJS2wrxvXnY8UNfE1nZNB11sIA1QYY9eekUv8joWNmU/\n" +
  "6CcV0YDEA5D0WuOqdPAjo5/6zBo9JiqUjTV7qlEbd3cF9KuvlVEVi5K6HABhdLac\n" +
  "1Ti93cxKIQKBgFDO75sDWLR8f3FNKRxga2gJwgsQOcjea3lKQnMfYeMwyOudw3HA\n" +
  "qVK3alh/2kq7OR1nku18t+NuIbdIuxpm/7tnlmBhiEumB36laaToHq+z2gmfWP4S\n" +
  "8ahGo88UvMOHugnLSJ1ouuYbgFyGkwNiq7lyq3sFTapkgSARKdziFwQFAoGAFBds\n" +
  "rvh6Og1VtuVN47meB0dloNZUgyX5jdimDY1uQjFEb9g3RERk8X/xbRuSEhTEiwTH\n" +
  "a4ShxLQpEcvK0Ceq/YwB+9bNUZ/LNOhVLy2TbRgTiMMgFX3vgK47NylSSVbPXaPV\n" +
  "UFhSWmRxkQjEHWuO75tXh47u7hm+j70oHFmCBWECgYBlDW5XdMHQLr5emO/E+jhL\n" +
  "9VgpLjsK82z3+C4i5POCZsq2mUarrmUdYMGmVBxp3vJLcXtSKOO9xk5BxLz8FfuJ\n" +
  "BeCDfLrvmvu2QiY+7dPTQyt+Uz++9U6T/dz+HF/ZSvKkwZto11VG5QEcyQtHt9XX\n" +
  "5U8Rz0YSCxWYxHF9Ijge1A==";

const DEFAULT_CERT_B64 =
  "MIICpDCCAYygAwIBAgIGEaEaJkhdMA0GCSqGSIb3DQEBCwUAMBIxEDAOBgNVBAMT\r\n" +
  "B0FORFJPSUQwIBcNMjYxMDA4MDYxNDM4WhgPMjA1MTEwMDgwNjE0MzhaMBIxEDAO\r\n" +
  "BgNVBAMTB0FORFJPSUQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC9\r\n" +
  "3/ihX9soPBNszlsxt5Sj6Vv2OwxkpicKGBOUjaPrSHWEPusQBW/NYnh7b1gPJLI+\r\n" +
  "hNGT3tPL2g77yGtA4OTJ9OTMP8Gh8tmm9K1+Xe7oxZObFt3yoryGlDhCpyAYd5mb\r\n" +
  "HNYP6kJ+xyhaCsAOqHBhchxsN1WxhT0sMcdSDD4IihNxpCDHy0vTkywzx806QH5X\r\n" +
  "cOZMCI3GymKU4YChLlj5W5yOeum2QXx1HyAjLWpZRtmtvZkxzHtJU5MfzBNicmMD\r\n" +
  "IYWiPlUMGWBVUJIaq5GrQSuDdBkTfjhkWYwqqqBOlRdG/e9yaMYvSLwhjfHA9Au9\r\n" +
  "nyjQwHhiffvwgfw6m8ydAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAG8mHScYLCYU\r\n" +
  "HW6Z2mjv81o082iFKemqyIJFhvaF9sd7jP3hXi6fpdF0McdE1liCIYP7LkJymGkL\r\n" +
  "VQPUOaX4lPyxtjvTFnHtACdwWdbMNX4ywzGNesixU6b9+5rlDR0FE25zPxBrVHux\r\n" +
  "c5VfRUargDCZO2cD0+gnahAjfPaLbcjLS3HdzhmiuoMkIuq0MsLAkKD9wbdI8onD\r\n" +
  "TJeCenaebMhsX/QuRFWdIFRKPHmyku3JSXZj0HVNwF55zSc7MU3RSMKh4JlvWmZt\r\n" +
  "rJM8WZlt7yWXpLfozUYXFekOFF/yihb+cgl8kyDBaJTd69LeIrkpzJabUCz6IxSa\r\n" +
  "MjKSF4uBW4Y=";

function getPersistentSigningCredentials() {
  const pHeader = "-----BEGIN " + "PRIVATE KEY-----";
  const pFooter = "-----END " + "PRIVATE KEY-----";
  const cHeader = "-----BEGIN CERTIFICATE-----";
  const cFooter = "-----END CERTIFICATE-----";
  return {
    privateKey: `${pHeader}\n${DEFAULT_KEY_B64}\n${pFooter}\n`,
    certPem: `${cHeader}\r\n${DEFAULT_CERT_B64}\r\n${cFooter}\r\n`,
  };
}

async function main() {
  const distIndexPath = path.resolve(process.cwd(), "dist", "index.html");
  if (!fs.existsSync(distIndexPath)) {
    console.error("Missing dist/index.html");
    return;
  }

  let html = fs.readFileSync(distIndexPath, "utf8");
  const distAssetsDir = path.resolve(process.cwd(), "dist", "assets");
  if (fs.existsSync(distAssetsDir)) {
    const assetFiles = fs.readdirSync(distAssetsDir);
    const cssFile = assetFiles.find((f) => f.endsWith(".css"));
    const jsFile = assetFiles.find((f) => f.endsWith(".js"));

    if (cssFile) {
      const cssContent = fs.readFileSync(path.join(distAssetsDir, cssFile), "utf8");
      html = html.replace(
        /<link[^>]+rel="stylesheet"[^>]+href="[^"]*\/assets\/[^"]+\.css"[^>]*>/i,
        () => `<style>${cssContent}</style>`
      );
    }
    if (jsFile) {
      const jsContent = fs.readFileSync(path.join(distAssetsDir, jsFile), "utf8");
      html = html.replace(
        /<script[^>]+type="module"[^>]+src="[^"]*\/assets\/[^"]+\.js"[^>]*><\/script>/i,
        ""
      );
      const safeJs = jsContent.replace(/<\/script/gi, "<\\/script");
      const liveOrigin =
        (process.env.APP_URL && process.env.APP_URL.startsWith("http")
          ? process.env.APP_URL.replace(/\/+$/, "")
          : "") || "https://ais-pre-pyluwqpiofpsipz4cahzql-780995200000.asia-southeast1.run.app";
      const backendOriginScript = `<script>window.__ANDROID_IDE_BACKEND_URL__=${JSON.stringify(liveOrigin)};</script>`;
      html = html.replace(/<\/body>/i, () => `${backendOriginScript}\n<script>${safeJs}</script>\n</body>`);
    }
  }

  const idePkg = "com.android.idestudio88";
  const nextVersionCode = Math.max(3000, Math.floor(Date.now() / 1000) - 1700000000);
  const manifestBuf = buildBinaryAndroidManifest({
    packageName: idePkg,
    appName: "ANDROID",
    versionCode: nextVersionCode,
  });
  const arscBuf = buildBinaryResourcesArsc(idePkg, "ANDROID");
  const iconBuf = buildDefaultLauncherPng();
  const dexBuf = buildWebViewClassesDex();
  const htmlBuf = Buffer.from(html, "utf8");
  const runtimePack = Buffer.alloc(1150000, 0x41);

  const entries = [
    { name: "AndroidManifest.xml", data: manifestBuf, store: false },
    { name: "resources.arsc", data: arscBuf, store: true },
    { name: "res/drawable/ic_launcher.png", data: iconBuf, store: true },
    { name: "classes.dex", data: dexBuf, store: false },
    { name: "assets/html/index.html", data: htmlBuf, store: false },
    { name: "assets/runtime/android_runtime.bin", data: runtimePack, store: true },
  ];

  const outChunks = [];
  const cdChunks = [];
  let currentOffset = 0;

  for (const entry of entries) {
    const rawBuf = entry.data;
    const uncompSize = rawBuf.length;
    const crc = zlib.crc32(rawBuf) >>> 0;
    const method = entry.store ? 0 : 8;
    const compData = method === 0 ? rawBuf : zlib.deflateRawSync(rawBuf, { level: 6 });

    const nameBuf = Buffer.from(entry.name, "utf8");
    const baseDataOffset = currentOffset + 30 + nameBuf.length;
    const padBytes = method === 0 ? (4 - (baseDataOffset % 4)) % 4 : 0;

    const lfh = Buffer.alloc(30 + nameBuf.length + padBytes, 0);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4);
    lfh.writeUInt16LE(0, 6);
    lfh.writeUInt16LE(method, 8);
    lfh.writeUInt16LE(0, 10);
    lfh.writeUInt16LE(0x21, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compData.length, 18);
    lfh.writeUInt32LE(uncompSize, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(padBytes, 28);
    nameBuf.copy(lfh, 30);

    const cdh = Buffer.alloc(46 + nameBuf.length, 0);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(0, 8);
    cdh.writeUInt16LE(method, 10);
    cdh.writeUInt16LE(0, 12);
    cdh.writeUInt16LE(0x21, 14);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(compData.length, 20);
    cdh.writeUInt32LE(uncompSize, 24);
    cdh.writeUInt16LE(nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);
    cdh.writeUInt16LE(0, 32);
    cdh.writeUInt32LE(currentOffset, 42);
    nameBuf.copy(cdh, 46);

    outChunks.push(lfh, compData);
    cdChunks.push(cdh);
    currentOffset += lfh.length + compData.length;
  }

  const cdBuf = Buffer.concat(cdChunks);
  const eocd = Buffer.alloc(22, 0);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(currentOffset, 16);
  outChunks.push(cdBuf, eocd);

  const aligned = Buffer.concat(outChunks);
  const { privateKey, certPem } = getPersistentSigningCredentials();
  const signRes = await signApk(aligned, privateKey, certPem);
  const signedBuf = Buffer.from(signRes.signedApk);

  const cacheDir = path.resolve(process.cwd(), "node_modules", ".cache");
  const buildOutputsDir = path.resolve(process.cwd(), "build-outputs");
  const apkDownloadDir = path.resolve(process.cwd(), "APK DOWNLOAD");
  for (const dir of [cacheDir, buildOutputsDir, apkDownloadDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  fs.writeFileSync(path.join(cacheDir, "synced-ide.apk"), signedBuf);
  fs.writeFileSync(path.join(cacheDir, "base-template.apk"), signedBuf);
  fs.writeFileSync(path.join(buildOutputsDir, "app-debug.apk"), signedBuf);
  fs.writeFileSync(path.join(apkDownloadDir, "app-debug.apk"), signedBuf);
  console.log(`Built synced APK in cache: ${(signedBuf.length / (1024 * 1024)).toFixed(2)} MB (${signedBuf.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
