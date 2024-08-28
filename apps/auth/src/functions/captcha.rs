use async_trait::async_trait;
use std::sync::OnceLock;

use hcaptcha::{HcaptchaCaptcha, HcaptchaClient, HcaptchaRequest};

use crate::{env::env, error::Error};

#[async_trait]
pub trait Captcha: Send + Sync {
    async fn validate(&self, captcha: Option<&str>) -> Result<(), Error>;
}

pub struct CaptchaDisabled;

#[async_trait]
impl Captcha for CaptchaDisabled {
    async fn validate(&self, _: Option<&str>) -> Result<(), Error> {
        Ok(())
    }
}

pub struct Hcaptcha {
    pub secret: String,
}

#[async_trait]
impl Captcha for Hcaptcha {
    async fn validate(&self, captcha: Option<&str>) -> Result<(), Error> {
        let client = HcaptchaClient::new();
        let resp = client
            .verify_client_response(HcaptchaRequest::new(
                &self.secret,
                HcaptchaCaptcha::new(captcha.ok_or(Error::CaptchaFailed)?)?,
            )?)
            .await?;
        if !resp.success() {
            return Err(Error::CaptchaFailed);
        }

        Ok(())
    }
}

static CAPTCHA: OnceLock<Box<dyn Captcha>> = OnceLock::new();
pub fn captcha() -> &'static Box<dyn Captcha> {
    CAPTCHA.get_or_init(|| match env().captcha.as_str() {
        "disabled" => Box::new(CaptchaDisabled),
        "hcaptcha" => Box::new(Hcaptcha {
            secret: env().captcha_secret.clone().unwrap(),
        }),
        _ => panic!("Invalid captcha provider"),
    })
}