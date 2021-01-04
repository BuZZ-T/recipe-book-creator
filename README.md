# Recipe book creator

A script creating pages including page numbers for handcrafting field-based book.

Currently, only DIN A4 sheets creating a DIN A5 book are supported.

## Configuration

Edit the file `page.html`, this file can be viewed in any chrom(e/ium) browser. Also look at the file `print.html`. This file uses JavaScript to change the content of the `page.html` inside iframes. For that reason, a chrom(e/ium) with flag `--disable-web-security` is required. npm run-scripts `npm run chrome` and `npm run chromium` are available for that reason.

## Create PDF

#### Open (locally installed) chromium for deep iframe editing

`npm run chromium`

#### Same, but use chrome instead
`npm run chrome`

#### Print page to PDF

`npm run print`

Available parameters: 

* `-papers-per-section` describes, how many sheets of papers are in one section (are folded together), defaults to 6
* `--sections` describes how many sections on top of each other define the book. A section is a bunch of papers, which are folded together, defaults to 8

Both parameters are used to calculate the correct page numbers on each page

##### Example

(add `--` before parameters to pass parameters to the script)

```bash
npm run print -- --papers-per-section=4 --sections=7
```

#### Merge all PDFs to one file using "pdfunite"

`npm run unite`

#### Remove all PDFs

`npm run clean`

## General classes

| HTML Element | class | description
|-|-|-
| `<body>` | `alternative` | Using the alternate design (labels on the lines, not inside of the fields)
| top level `<div>` | `page` | Declaring a page table
| top level `<div>` | `seam` | Declaring the seam in the middle of the sheet
| `<div>`inside `seam` | `stitch` | Declaring a stitch marker on the seam, useful for sewing the sections together
| `<div>` inside `table` | `line` | Declaring a new line of fields
| `<div>` inside `line` | `field` | Declaring a new field with a label

## Customizing fields

### Normal field

Add a field with an attribute `data-label` inside a line, to declare a field. Multiple fields in a line automatically have the same size.

#### Example
```html
<div class="line">
	<div class="field" data-label="First"></div>
	<div class="field" data-label="Second"></div>	
</div>
```

### Fraction

If you want a field to have the size of a certain fraction of the line, add the class `fraction` including one of `half`, `third`, `quarter`, `fifth` or `sixth`. Fields without `fraction` class will 

#### Example

```html

```

### Units

To automatically add unit labels inside of fields, add the class `unit` plus the respective unit:

| Class | Unit | Example
|-|-|-
| `l`or `liter` | Liter | 
`kg` | Kilogramm |
`g` | Gramm | 
`ml` | Milliliter | 
`something` | Gramm or Milliliter
`custom` | Value provided by attribute `data-unit` | `<div class="field unit custom" data-label="MyLabel" data-unit="MyUnit"></div>`

#### Examples
```html
<div class="line">
	<div class="field unit kg" data-label="Sugar"></div>
	<div class="field unit liter" data-label="Water"></div>
	<div class="field unit custom" data-label="MyLabel" data-unit="MyUnit"></div>
</div>
```

## Customizing lines

### Growing line

To add a line which automatically grabs all the remaining space, add the class `fill-height`.

#### Example
```html
<div class="line fill-height">
	<div class="field" data-label="My huge field"></div>
</div>
```
