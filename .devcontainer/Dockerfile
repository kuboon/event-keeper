ARG VARIANT="hirsute"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
 && apt-get -y install --no-install-recommends fish
RUN chsh -s /usr/bin/fish vscode
USER vscode
SHELL ["/usr/bin/fish", "-l", "-c"]
RUN git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.8.1 \
 && mkdir -p ~/.config/fish/completions; and ln -s ~/.asdf/completions/asdf.fish ~/.config/fish/completions \
 && echo "source ~/.asdf/asdf.fish" >> $HOME/.config/fish/config.fish
RUN asdf plugin add deno && asdf install deno latest && asdf global deno latest
# RUN deno install -A -f -n land https://deno.land/x/land@v0.7.0/cli.ts
RUN deno install -qAn vr https://deno.land/x/velociraptor@1.4.0/cli.ts
RUN deno install -A -f --no-check -n fresh https://raw.githubusercontent.com/lucacasonato/fresh/main/cli.ts
RUN asdf reshim
