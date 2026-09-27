{
  description = "AI Resume Analyzer";

  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.zst";
  };

  outputs = inputs: {
    packages = builtins.mapAttrs (system: pkgs: {
      default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_22
          pnpm
        ];

        shellHook = ''
          echo "node $(node --version) | npm $(npm --version) | pnpm $(pnpm --version)"
        '';
      };
    }) inputs.nixpkgs.legacyPackages;
  };
}
