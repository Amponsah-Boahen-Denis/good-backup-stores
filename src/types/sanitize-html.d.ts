declare module 'sanitize-html' {
  function sanitizeHtml(dirty: string, options?: SanitizeHtmlOptions): string;
  
  interface SanitizeHtmlOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    disallowedTagsMode?: 'discard' | 'escape' | 'recursiveEscape';
    selfClosing?: string[];
    textFilter?: (text: string) => string;
    transformTags?: Record<string, (tagName: string, attribs: Record<string, string>) => { tagName: string; attribs: Record<string, string> }>;
    exclusiveFilter?: (frame: any) => boolean;
  }
  
  export = sanitizeHtml;
}
