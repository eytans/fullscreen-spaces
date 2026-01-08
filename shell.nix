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
    
    # Graphics/Mesa for nested GNOME shell testing
    mesa
    mesa.drivers
    libglvnd
    
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
    
    # Set up Mesa/libGL paths for nested GNOME shell testing
    export LIBGL_DRIVERS_PATH="${pkgs.mesa.drivers}/lib/dri"
    export LD_LIBRARY_PATH="${pkgs.mesa}/lib:${pkgs.mesa.drivers}/lib:${pkgs.libglvnd}/lib:$LD_LIBRARY_PATH"
  '';
}
