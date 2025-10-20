# GeoINT assessment notes

- Board is on Trello (https://trello.com/b/dpPH1m63/geoint-assessment)
- Repo works via github login (pvt email, pw managed by Chrome) - requires GitHub Desktop
- Docker install process: https://docs.docker.com/desktop/setup/install/windows-install/


# How to deploy

Requirements:
- git
- docker
- docker-postgis

With git and docker both installed, clone this repository.

Clone docker-postgis from `https://github.com/kartoza/docker-postgis` intp the top-level directory (same path as this readme). This clones the postgis docker deployment into the `./docker-postgis` folder, which git ignores.

Run with:
```bash
docker compose up -d
```
