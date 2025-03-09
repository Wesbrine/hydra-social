> [!NOTE]

<p align="center">
  <a style="text-decoration:none" href=" >
    <img alt=" " src=" " />
  </a>
</p>

<p align="center">
  <a style="text-decoration:none" href=" ">
    <img src=" " alt="Release" /></a>
  <a style=" " href=" ">
    <img src=" " alt=" " /></a>
  <a style=" " href=" ">
    <img SRC=" " alt=" " /></a>
</p>

 is a **free, open-source social network server** based on ActivityPub where users can follow friends and discover new ones. On Mastodon, users can publish anything they want: links, pictures, text, and video. All Mastodon servers are interoperable as a federated network (users on one server can seamlessly communicate with users from another one, including non-Mastodon software that implements ActivityPub!)

## Navigation


[## Features

<img src="/app/javascript/images/elephant_ui_working.svg?raw=true" align="right" width="30%" />

**No vendor lock-in: Fully interoperable with any conforming platform** - It doesn't have to be Mastodon; whatever implements ActivityPub is part of the social network! [Learn more](https://blog.joinmastodon.org/2018/06/why-activitypub-is-the-future/)

**Real-time, chronological timeline updates** - updates of people you're following appear in real-time in the UI via WebSockets. There's a firehose view as well!

**Media attachments like images and short videos** - upload and view images and WebM/MP4 videos attached to the updates. Videos with no audio track are treated like GIFs; normal videos loop continuously!

**Safety and moderation tools** - Mastodon includes private posts, locked accounts, phrase filtering, muting, blocking, and all sorts of other features, along with a reporting and moderation system. [Learn more](https://blog.joinmastodon.org/2018/07/cage-the-mastodon/)

**OAuth2 and a straightforward REST API** - Mastodon acts as an OAuth2 provider, so 3rd party apps can use the REST and Streaming APIs. This results in a rich app ecosystem with a lot of choices!

## Deployment

### Tech stack

- **Ruby on Rails** powers the REST API and other web pages
- **React.js** and **Redux** are used for the dynamic parts of the interface
- **Node.js** powers the streaming API

### Requirements

- **PostgreSQL** 12+
- **Redis** 4+
- **Ruby** 3.2+
- **Node.js** 18+

The repository includes deployment configurations for **Docker and docker-compose** as well as specific platforms like **Heroku**, and **Scalingo**. For Helm charts, reference the [mastodon/chart repository](https://github.com/mastodon/chart). The [**standalone** installation guide](https://docs.joinmastodon.org/admin/install/) is available in the documentation.

## Contributing

Mastodon is **free, open-source software** licensed under **AGPLv3**.

You can open issues for bugs you've found or features you think are missing. You
can also submit pull requests to this repository or translations via Crowdin. To
get started, look at the [CONTRIBUTING] and [DEVELOPMENT] guides. For changes
accepted into Mastodon, you can request to be paid through our [OpenCollective].

**IRC channel**: #mastodon on [`irc.libera.chat`](https://libera.chat)

## License

Copyright (c) 2016-2024 Eugen Rochko (+ [`mastodon authors`](AUTHORS.md))

Licensed under GNU Affero General Public License as stated in the [LICENSE](LICENSE):

```
Copyright (c) 2016-2024 Eugen Rochko & other Mastodon contributors

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see https://www.gnu.org/licenses/
```

[CONTRIBUTING]: CONTRIBUTING.md
[DEVELOPMENT]: docs/DEVELOPMENT.md
[OpenCollective]: