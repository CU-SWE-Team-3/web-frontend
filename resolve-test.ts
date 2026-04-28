import { resolvePermalink } from './src/lib/resolvePermalink';

console.log("Testing full URL for tracks:");
console.log(resolvePermalink('https://soundcloud.com/tracks/my-awesome-track'));

console.log("\nTesting full URL for profile:");
console.log(resolvePermalink('http://localhost:3000/profile/john-doe'));

console.log("\nTesting relative path for tracks:");
console.log(resolvePermalink('/tracks/summer-vibes'));

console.log("\nTesting relative path for profile:");
console.log(resolvePermalink('/profile/jane_smith'));

console.log("\nTesting unknown path:");
console.log(resolvePermalink('/settings/account'));

console.log("\nTesting empty string:");
console.log(resolvePermalink(''));
