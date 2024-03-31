FROM python:3.11-bookworm AS build

WORKDIR /api

COPY . /api
RUN pip install pipenv
RUN PIPENV_VENV_IN_PROJECT=true \
      pipenv \
      --python /usr/bin/python3 \
      sync

FROM gcr.io/distroless/python3-debian12

ENV FASTAPI_ENV=production

WORKDIR /api
COPY --from=build /api /api

EXPOSE 8000
ENTRYPOINT [".venv/bin/python", "-m", "server"]