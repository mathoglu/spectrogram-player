export function isUrlValid(url?: string) {
  const regex = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/;
  return url && url.length < 1000 && regex.test(url);
}
