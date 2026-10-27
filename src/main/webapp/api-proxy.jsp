<%@ page contentType="application/json; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.InputStream" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="java.net.HttpURLConnection" %>
<%@ page import="java.net.URL" %>
<%@ page import="java.net.URLEncoder" %>
<%@ page import="java.nio.charset.StandardCharsets" %>
<%@ page import="java.util.Set" %>
<%
request.setCharacterEncoding("UTF-8");
response.setHeader("Cache-Control", "no-store");

if (!"POST".equalsIgnoreCase(request.getMethod())) {
  response.setStatus(HttpURLConnection.HTTP_BAD_METHOD);
  out.print("{\"message\":\"POST required\"}");
  return;
}

String resource = request.getParameter("resource");
Set<String> allowedResources = Set.of("group", "dataset", "datastore", "dump/datastore");
if (resource == null || !allowedResources.contains(resource)) {
  response.setStatus(HttpURLConnection.HTTP_BAD_REQUEST);
  out.print("{\"message\":\"Unsupported API resource\"}");
  return;
}

String apiKey = request.getParameter("apikey");
if (apiKey == null || apiKey.isBlank() || apiKey.length() > 256) {
  response.setStatus(HttpURLConnection.HTTP_BAD_REQUEST);
  out.print("{\"message\":\"A valid API key is required\"}");
  return;
}

String[] allowedParameters = resource.equals("datastore")
  ? new String[] {"apikey", "format", "capcode", "govcode", "countycode", "effectivetime", "expirestime", "limit", "offset"}
  : resource.equals("dump/datastore")
    ? new String[] {"apikey", "capid", "format"}
    : new String[] {"apikey", "format", "limit", "offset"};

StringBuilder query = new StringBuilder();
for (String name : allowedParameters) {
  String value = request.getParameter(name);
  if (value != null && !value.isBlank()) {
    if (query.length() > 0) query.append('&');
    query.append(URLEncoder.encode(name, StandardCharsets.UTF_8));
    query.append('=');
    query.append(URLEncoder.encode(value, StandardCharsets.UTF_8));
  }
}

if (!"json".equals(request.getParameter("format"))) {
  response.setStatus(HttpURLConnection.HTTP_BAD_REQUEST);
  out.print("{\"message\":\"Only JSON responses are supported\"}");
  return;
}
if (resource.equals("dump/datastore") && (request.getParameter("capid") == null || request.getParameter("capid").isBlank())) {
  response.setStatus(HttpURLConnection.HTTP_BAD_REQUEST);
  out.print("{\"message\":\"capid is required\"}");
  return;
}

HttpURLConnection connection = null;
try {
  URL url = new URL("https://alerts.ncdr.nat.gov.tw/api/" + resource + "?" + query);
  connection = (HttpURLConnection) url.openConnection();
  connection.setRequestMethod("GET");
  connection.setConnectTimeout(10000);
  connection.setReadTimeout(20000);
  connection.setRequestProperty("Accept", "application/json");

  int upstreamStatus = connection.getResponseCode();
  InputStream stream = upstreamStatus >= 400 ? connection.getErrorStream() : connection.getInputStream();
  StringBuilder payload = new StringBuilder();
  if (stream != null) {
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
      String line;
      while ((line = reader.readLine()) != null) payload.append(line);
    }
  }
  response.setStatus(upstreamStatus);
  out.print(payload.length() > 0 ? payload : "{}");
} catch (Exception exception) {
  response.setStatus(HttpURLConnection.HTTP_BAD_GATEWAY);
  out.print("{\"message\":\"NCDR API request failed\"}");
} finally {
  if (connection != null) connection.disconnect();
}
%>