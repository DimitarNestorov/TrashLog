{
	inputs = {
		nixpkgs.url = github:NixOS/nixpkgs/nixpkgs-unstable;
		flake-utils.url = github:numtide/flake-utils;
		devshell = {
			url = "github:numtide/devshell";
			inputs = {
				nixpkgs.follows = "nixpkgs";
				flake-utils.follows = "flake-utils";
			};
		};
		android-nixpkgs = {
			url = github:tadfisher/android-nixpkgs/stable;
			inputs = {
				nixpkgs.follows = "nixpkgs";
				flake-utils.follows = "flake-utils";
				devshell.follows = "devshell";
			};
		};
	};

	outputs = { self, nixpkgs, flake-utils, android-nixpkgs, ... }:
		flake-utils.lib.eachDefaultSystem (system:
			let
				pkgs = nixpkgs.legacyPackages.${system};
				node = pkgs.nodejs-18_x;
				yarn-berry = (pkgs.yarn-berry.override { nodejs = node; });
				android-sdk = android-nixpkgs.sdk.${system} (sdkPkgs: with sdkPkgs; [
					cmdline-tools-latest
					build-tools-34-0-0
					platform-tools
					platforms-android-34
					emulator
				]);
			in
			{
				devShell = pkgs.mkShell {
					packages = [
						node
						yarn-berry
						android-sdk
					];

					shellHook = ''
						export ANDROID_HOME=${android-sdk}/share/android-sdk
						yarn install
					'';
				};
			}
		);
}