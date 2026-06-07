const multipartType = /^multipart\/form-data/i;

function parseMultipartFields(buffer, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!boundaryMatch) {
    return {};
  }

  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const body = buffer.toString("utf8");
  const fields = {};

  body.split(boundary).forEach((part) => {
    const [rawHeaders, ...rawValue] = part.split("\r\n\r\n");

    if (!rawHeaders || rawValue.length === 0) {
      return;
    }

    const nameMatch = rawHeaders.match(/name="([^"]+)"/);
    const hasFile = /filename="/.test(rawHeaders);

    if (!nameMatch || hasFile) {
      return;
    }

    const value = rawValue
      .join("\r\n\r\n")
      .replace(/\r\n--$/, "")
      .replace(/\r\n$/, "");

    fields[nameMatch[1]] = value;
  });

  return fields;
}

function formDataMiddleware(req, res, next) {
  const contentType = req.headers["content-type"] || "";

  if (!multipartType.test(contentType)) {
    return next();
  }

  const chunks = [];

  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    req.body = parseMultipartFields(Buffer.concat(chunks), contentType);
    next();
  });
  req.on("error", next);
}

module.exports = formDataMiddleware;
