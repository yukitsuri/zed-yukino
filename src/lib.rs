use zed_extension_api::{self as zed, Command, LanguageServerId, Result, Worktree};

struct YukinoExtension;

impl zed::Extension for YukinoExtension {
    fn new() -> Self { Self }

    fn language_server_command(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &Worktree,
    ) -> Result<Command> {
        let path = worktree
            .which("yukino-lsp")
            .ok_or_else(|| "Cannot find yukino-lsp bin. Please, install yukitsuri/yukino-lsp".to_string())?;

        Ok(Command {
            command: path,
            args: vec!["lsp".to_string()],
            env: Default::default(),
        })
    }
}

zed::register_extension!(YukinoExtension);
