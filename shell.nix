# shell.nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Basic development tools
    gnumake
    nodejs
    git

    # GNOME development specific
    gnome-shell
    glib
    gjs
    libxml2
    
    # Development tools
    shellcheck    # For shell script linting
    eslint       # For JavaScript linting
    typescript   # For type checking (optional but recommended)
    
    # Extra utilities
    jq           # Useful for handling JSON files
    meson        # Build system used by GNOME
    ninja        # Build system used by GNOME
  ];

  shellHook = ''
    export XDG_DATA_DIRS="${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS"
    export G_MESSAGES_DEBUG=all
  '';
}
