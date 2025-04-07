const USERNAME = 'ndy7stillx86ihz';
const REPO_NAME = `mataburros`;
const API_URL = `https://api.github.com/repos/${USERNAME}/${REPO_NAME}/contents/`;
const CONTENTS_URL = `https://raw.githubusercontent.com/${USERNAME}/${REPO_NAME}/main/`;
const CACHE_KEY = `${REPO_NAME}_tree`;
const CACHE_TIME_KEY = `${REPO_NAME}_tree_time`;
const CACHE_LIFETIME = 1000 * 60 * 60 * 24; // 1 día