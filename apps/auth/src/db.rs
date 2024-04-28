use std::{sync::OnceLock, time::Duration};

use log::warn;
use muonic::Muonic;
use sqlx::{migrate::MigrateDatabase, PgPool, Postgres};
use tokio::{sync::OnceCell, time::timeout};

use crate::{env::env, error::Error};

static DB: OnceCell<PgPool> = OnceCell::const_new();

pub async fn init() -> Result<&'static PgPool, Error> {
    let db_url = &env().database_url_superego;
    DB.get_or_try_init(|| async {
        if !Postgres::database_exists(&db_url).await.unwrap() {
            warn!("Database does not exist, creating...");
            Postgres::create_database(&db_url).await.unwrap();
        }

        let pool = timeout(Duration::from_secs(15), sqlx::PgPool::connect(db_url))
            .await
            .unwrap()
            .unwrap();

        sqlx::migrate!().run(&pool).await.unwrap();
        Ok(pool)
    })
    .await
}

pub fn db() -> &'static PgPool {
    DB.get().expect("Database not initialized")
}

pub fn muon() -> &'static muonic::Muonic<'static> {
    static MUON: OnceLock<Muonic> = OnceLock::new();
    MUON.get_or_init(|| Muonic::new(db()))
}
