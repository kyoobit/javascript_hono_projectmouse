export function getSecureHeaders(opts?: {
    script_hashes?: string[]
}): Record<string, string> {

    const script_src = [
        "'strict-dynamic'",
        "https:",
        ...(opts?.script_hashes || []),
    ].join(' ');

    return {
        // https://developer.mozilla.org/en-US/observatory/analyze
        // Content Security Policy (CSP) HTTP response header
        // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
        // https://csp-evaluator.withgoogle.com
        'Content-Security-Policy': [
            `default-src 'self' https:`, // default-src: load resources that are from the same-origin as the document using https only
            //`image-src 'self' ${data.domain}`,
            //`style-src 'self' ${data.domain}`,
            `script-src ${script_src}`, // 'strict-dynamic': Allow trusted scripts to load additional scripts
            `object-src 'none'`, // block all <object> and <embed> resources
            `base-uri 'none'`, // block all uses of the <base> element to set a base URI
            `require-trusted-types-for 'script'`, // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for
        ].join('; '),
        // MIME types HTTP response header
        // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/MIME_types
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
        'X-Content-Type-Options': 'nosniff',
        // Clickjacking HTTP response header
        // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Clickjacking
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
        'X-Frame-Options': 'DENY',
        // Referrer policy HTTP response header
        // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Referrer_policy
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
        'Referrer-Policy': 'same-origin',
        // Cross-Origin Resource Policy (CORP) HTTP response header
        // https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CORP
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy
        'Cross-Origin-Resource-Policy': 'same-origin',
    };
}
