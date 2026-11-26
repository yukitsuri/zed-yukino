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

    fn label_for_completion(
        &self,
        _language_server_id: &LanguageServerId,
        completion: zed::lsp::Completion,
    ) -> Option<zed::CodeLabel> {
        if matches!(completion.kind, Some(zed::lsp::CompletionKind::File))
            && completion.detail.as_deref() == Some("C header")
        {
            let filter_end = completion.label.len();
            return Some(zed::CodeLabel {
                code: format!("cload \"{}\"", completion.label),
                spans: vec![zed::CodeLabelSpan::literal(
                    completion.label,
                    Some("string".to_string()),
                )],
                filter_range: (0..filter_end).into(),
            });
        }
        None
    }
}

zed::register_extension!(YukinoExtension);
