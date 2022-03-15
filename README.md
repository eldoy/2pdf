# 2pdf

Command line tool for creating PDFs from HTML files.

Based on [html-pdf.](https://github.com/marcbachmann/node-html-pdf)

### Install

```sh
npm i -g 2pdf
```

### Usage

The pdf files will output to the same directory as the input file by default.

```sh
# Multiple files supported
2pdf file1.html file2.html

# Named output files
2pdf file1.html:file1.pdf


# Named output files, shortcut
2pdf file1:file1
```

MIT Licensed. Enjoy!
