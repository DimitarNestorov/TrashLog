{
	inputs = {
		nixpkgs.url = github:NixOS/nixpkgs/nixos-23.11;
		flake-utils.url = github:numtide/flake-utils;
	};

	outputs = { self, nixpkgs, flake-utils }:
		flake-utils.lib.eachDefaultSystem (system:
			let
				pkgs = nixpkgs.legacyPackages.${system};
				node = pkgs.nodejs-18_x;
				yarn-berry = (pkgs.yarn-berry.override { nodejs = node; });
			in
			{
				devShell = pkgs.mkShell {
					packages = [
						node
						yarn-berry
					];

					shellHook = ''
						yarn install
					'';
				};
			}
		);
}