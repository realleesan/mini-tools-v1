# Quote Templates Directory

This directory contains .docx template files for quote generation.

## How to use:

1. Create a quote template in the frontend
2. Upload your .docx file with placeholders like {{customerName}}, {{price}}, etc.
3. The system will merge your data with the template to generate quotes

## Template Placeholder Format:

Use double curly braces for placeholders:
- {{customerName}} - Customer name
- {{companyName}} - Company name  
- {{price}} - Price amount
- {{date}} - Date
- {{description}} - Product/service description
- etc.

## Example Template Structure:

```
QUOTE

Date: {{date}}
Customer: {{customerName}}
Company: {{companyName}}

Product/Service: {{productName}}
Description: {{description}}
Price: {{price}}
Tax: {{tax}}
Total: {{total}}

Valid until: {{validUntil}}
```

## Supported File Format:
- .docx (Microsoft Word format)