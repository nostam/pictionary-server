function defaultAvatar(username: string) {
  return `https://eu.ui-avatars.com/api/?name=${username}&background=random&bold=true&length=2`;
}

module.exports = { defaultAvatar };
