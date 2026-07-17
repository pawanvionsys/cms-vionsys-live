'use client';

import React from 'react';
import { FormField } from '../shared/FormField';
import { SchemaGenerator } from '../../../features/seo/schema-generator';
import { Code2 } from 'lucide-react';

interface SchemaPanelProps {
  schema: any;
  onChange: (field: string, value: any) => void;
  title: string;
  excerpt: string;
  slug: string;
  contentType: 'blog' | 'case-study';
  featuredImage?: string | null;
  clientName?: string;
  industry?: string;
}

export function SchemaPanel({
  schema = {},
  onChange,
  title,
  excerpt,
  slug,
  contentType,
  featuredImage,
  clientName = 'Client Name',
  industry = 'IT'
}: SchemaPanelProps) {
  // 1. Resolve selected schema type
  const schemaType = schema.type || (contentType === 'blog' ? 'BlogPosting' : 'CaseStudy/WebPage');

  // 2. State to check for custom JSON validity
  const [isValidJson, setIsValidJson] = React.useState(true);

  React.useEffect(() => {
    if (!schema.customSchemaJson || !schema.customSchemaJson.trim()) {
      setIsValidJson(true);
      return;
    }
    try {
      JSON.parse(schema.customSchemaJson);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  }, [schema.customSchemaJson]);

  // 3. Generate preview jsonld
  const getPreviewJsonLd = () => {
    if (contentType === 'blog') {
      return SchemaGenerator.generateBlogPostingSchema({
        title,
        slug,
        excerpt,
        featuredImage,
        updatedAt: new Date(),
        authorName: 'Vionsys Author'
      });
    } else {
      return SchemaGenerator.generateCaseStudySchema({
        title,
        slug,
        excerpt,
        heroImage: featuredImage,
        updatedAt: new Date(),
        clientName,
        industry
      });
    }
  };

  const jsonLdString = schema.customSchemaJson && schema.customSchemaJson.trim()
    ? schema.customSchemaJson
    : JSON.stringify(getPreviewJsonLd(), null, 2);

  return (
    <div className="space-y-5">
      {/* Schema Type selector */}
      <FormField label="Schema Markup Type">
        <select
          value={schemaType}
          onChange={e => onChange('type', e.target.value)}
          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
        >
          {contentType === 'blog' ? (
            <>
              <option value="BlogPosting">BlogPosting (Recommended)</option>
              <option value="Article">Article</option>
              <option value="HowTo">HowTo Guide</option>
              <option value="FAQPage">FAQ Page</option>
            </>
          ) : (
            <>
              <option value="CaseStudy/WebPage">CaseStudy/WebPage (Recommended)</option>
              <option value="FAQPage">FAQ Page</option>
            </>
          )}
        </select>
      </FormField>

      {/* Custom Schema JSON Editor Textarea */}
      <FormField label="Custom JSON-LD Schema (Optional Override)">
        <div className="space-y-1">
          <textarea
            value={schema.customSchemaJson || ''}
            onChange={e => onChange('customSchemaJson', e.target.value)}
            placeholder='e.g. {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Custom Product Schema"
}'
            rows={8}
            className={`w-full text-xs font-mono p-3 border rounded-lg bg-white focus:outline-hidden leading-relaxed ${
              isValidJson ? 'border-slate-200 focus:border-indigo-500' : 'border-red-300 focus:border-red-500'
            }`}
          />
          {!isValidJson && (
            <p className="text-[10px] text-red-500 font-semibold">
              ⚠️ Invalid JSON format. Please verify double quotes and braces.
            </p>
          )}
        </div>
      </FormField>

      {/* JSON-LD Code Block Preview */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-indigo-500" />
          JSON-LD Live Preview {schema.customSchemaJson && schema.customSchemaJson.trim() ? '(Custom Override)' : '(Auto-Generated)'}
        </label>
        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[10px] overflow-x-auto max-h-80 leading-relaxed border border-slate-950">
          <pre>{jsonLdString}</pre>
        </div>
      </div>
    </div>
  );
}
export default SchemaPanel;
