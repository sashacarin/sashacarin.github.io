<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>

<xsl:template match="/rss/channel">
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title><xsl:value-of select="title"/> &#8212; RSS feed</title>
  <style>
    html { background: #141414; }
    body {
      font-family: "Courier New", Courier, monospace;
      font-size: 16px;
      line-height: 1.5;
      color: #000;
      background: #fff;
      max-width: 680px;
      margin: 0 auto;
      padding: 4em 1em 2em;
      box-sizing: border-box;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      min-height: 100vh;
    }
    a { color: #0000ee; }
    a:visited { color: #551a8b; }
    hr { border: none; border-top: 1px solid #000; margin: 1.5em 0; }
    h1, h2 { font-weight: bold; margin: 1em 0 0.5em; }
    h1 { font-size: 1.6em; }
    h2 { font-size: 1.1em; }
    .lede { font-size: 0.95em; color: #333; }
    .url {
      display: block;
      border: 1px solid #000;
      background: #f7f7f0;
      padding: 0.6em 0.8em;
      margin: 1em 0;
      font-size: 0.95em;
      word-break: break-all;
      user-select: all;
    }
    ul.posts { list-style: none; padding: 0; }
    ul.posts li { margin: 0.4em 0; }
    ul.posts .date { display: inline-block; width: 8em; color: #555; }
    footer { margin-top: 2em; font-size: 0.9em; color: #555; }
  </style>
</head>
<body>

<h1><xsl:value-of select="title"/> &#8212; RSS feed</h1>

<p class="lede">give this link to whatever feeder u use.</p>

<code class="url"><xsl:value-of select="atom:link/@href" xmlns:atom="http://www.w3.org/2005/Atom"/></code>

<p class="lede">
  reccommend &#8212; NetNewsWire, Feedly, Inoreader, Miniflux,
  whatever you use should work.
</p>

<hr/>

<h2>will feed you -></h2>
<ul class="posts">
  <xsl:for-each select="item">
    <li>
      <span class="date"><xsl:value-of select="substring(pubDate, 6, 11)"/></span>
      <a><xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
        <xsl:value-of select="title"/>
      </a>
    </li>
  </xsl:for-each>
</ul>

<hr/>

<footer>
  <a><xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>back to <xsl:value-of select="title"/></a>
</footer>

</body>
</html>
</xsl:template>

</xsl:stylesheet>
