export const SOURCES = {
    danbooru: {
      name: 'Danbooru',
      url: 'https://danbooru.donmai.us/posts.json',
      params: (tags, page) => ({
        tags: `${tags} rating:g`,
        limit: 10,
        page
      }),
      parser: (data) => data,
      caption: (post) => `Artist: ${post.tag_string_artist || 'Unknown'}`,
      headers: {}
    },
    e926: {
      name: 'e926',
      url: 'https://e621.net/posts.json',
      params: (tags, page) => ({
        tags: `${tags} rating:safe`,
        limit: 10,
        page
      }),
      parser: (data) => data.posts,
      caption: (post) => `Artist: ${post.tags.artist?.join(', ') || 'Unknown'}`,
      headers: { 'User-Agent': 'YumeFinderBot/0.5' }
    },
    e621: {
      name: 'e621',
      url: 'https://e621.net/posts.json',
      params: (tags, page) => ({
        tags,
        limit: 10,
        page
      }),
      parser: (data) => data.posts,
      caption: (post) => `Artist: ${post.tags.artist?.join(', ') || 'Unknown'}`,
      restricted: true,
      headers: { 'User-Agent': 'YumeFinderBot/0.5' }
    },
    rule34: {
      name: 'Rule34',
      url: 'https://api.rule34.xxx/index.php',
      params: (tags, page) => ({
        page: 'dapi',
        s: 'post',
        q: 'index',
        json: 1,
        tags,
        pid: page,
        limit: 10
      }),
      parser: (data) => data,
      caption: (post) => `Artist: ${post.owner || 'Unknown'}`,
      restricted: true,
      headers: {}
    },
    gelbooru: {
      name: 'Gelbooru',
      url: 'https://gelbooru.com/index.php',
      params: (tags, page) => ({
        page: 'dapi',
        s: 'post',
        q: 'index',
        json: 1,
        tags: `${tags} rating:general`,
        pid: page,
        limit: 10
      }),
      parser: (data) => data.post || [],
      caption: (post) => `Artist: ${post.owner || 'Unknown'}`,
      headers: { 'User-Agent': 'YumeFinderBot/0.5' }
    }
  };