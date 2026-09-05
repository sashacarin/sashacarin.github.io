<?xml version="1.0" encoding="UTF-8"?>
<!--
  Makes feed.xml render as a readable page when somebody opens it in a
  browser, instead of a wall of XML.

  Browsers dropped RSS handling years ago: clicking a feed link doesn't
  subscribe you to anything, it just shows you the file. Feed readers are what
  subscribe. So the page a browser lands on should say that, and hand over the
  address to paste. Readers themselves ignore this stylesheet entirely and
  parse the XML underneath, so nothing here affects subscribers.
-->
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

<p class="lede">
  You've landed on the feed itself. This is a file for software to read, which
  is why it looks like this &#8212; browsers stopped knowing what to do with
  feeds years ago, so clicking the link didn't subscribe you to anything.
</p>

<p class="lede">A feed reader is what subscribes. Give it this address:</p>

<code class="url"><xsl:value-of select="atom:link/@href" xmlns:atom="http://www.w3.org/2005/Atom"/></code>

<p class="lede">
  Any reader will take it &#8212; NetNewsWire, Feedly, Inoreader, Miniflux,
  whatever you like. New posts turn up there on their own.
</p>

<hr/>

<h2>In this feed</h2>
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
