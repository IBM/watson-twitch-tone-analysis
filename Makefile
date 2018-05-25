build:
	docker build -t nibalizer/watson-twitch-tone-analysis .

push:
	docker push nibalizer/watson-twitch-tone-analysis

bxbuild:
	bx cr build -t nibalizer/watson-twitch-tone-analysis .

