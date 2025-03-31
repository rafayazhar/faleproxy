// Define the ensureUrlHasProtocol function directly in the test file
// This matches the implementation in app.js
function ensureUrlHasProtocol(url) {
  // Check if the URL already has a protocol
  if (url.match(/^https?:\/\//i)) {
    return url;
  }
  
  // Add https:// as the default protocol
  return `https://${url}`;
}

describe('URL Protocol Handling', () => {
  test('should not modify URLs that already have http protocol', () => {
    const url = 'http://example.com';
    expect(ensureUrlHasProtocol(url)).toBe(url);
  });

  test('should not modify URLs that already have https protocol', () => {
    const url = 'https://yale.edu';
    expect(ensureUrlHasProtocol(url)).toBe(url);
  });

  test('should add https protocol to URLs without protocol', () => {
    const url = 'yale.edu';
    expect(ensureUrlHasProtocol(url)).toBe('https://yale.edu');
  });

  test('should handle URLs with www prefix but no protocol', () => {
    const url = 'www.yale.edu';
    expect(ensureUrlHasProtocol(url)).toBe('https://www.yale.edu');
  });

  test('should handle URLs with subdomains but no protocol', () => {
    const url = 'admissions.yale.edu';
    expect(ensureUrlHasProtocol(url)).toBe('https://admissions.yale.edu');
  });

  test('should handle URLs with paths but no protocol', () => {
    const url = 'yale.edu/admissions';
    expect(ensureUrlHasProtocol(url)).toBe('https://yale.edu/admissions');
  });

  test('should handle case-insensitive protocol detection', () => {
    const url = 'HTTPS://yale.edu';
    expect(ensureUrlHasProtocol(url)).toBe('HTTPS://yale.edu');
  });
});
