use std::ops::Deref;

use aide::OperationIo;
use axum::{
    extract::{FromRequestParts, Path},
    http::request::Parts,
};
use uuid::Uuid;

use crate::{
    db::db,
    entities::{Channel, MemberExt, MemberKey, Space, SpaceExt, SpaceUser},
    error::Error,
    functions::jwt::Claims,
};

/// Load is a wrapper for implementing extractors on database entities, to be fetched from
/// the database.
#[derive(OperationIo)]
pub struct Load<T>(pub T);

impl<T> From<T> for Load<T> {
    fn from(value: T) -> Self {
        Self(value)
    }
}

impl<T> Deref for Load<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpacePath {
    pub space_id: Uuid,
}

#[async_trait]
impl<S> FromRequestParts<S> for Load<SpaceExt>
where
    S: Send + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let path: Path<SpacePath> = Path::from_request_parts(parts, state).await.map_err(|_| {
            Error::InternalServerError {
                message: "spaceId not found".to_string(),
            }
        })?;

        let space = Space::find_by_id(path.space_id, db()).await?;
        let space = SpaceExt::dataload_one(space, db()).await?;

        parts.extensions.insert(space.clone());
        Ok(space.into())
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for Load<MemberExt>
where
    S: Send + Sync,
{
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let path: Path<SpacePath> = Path::from_request_parts(parts, state).await.map_err(|_| {
            Error::InternalServerError {
                message: "spaceId was not found".to_string(),
            }
        })?;

        // let claim = Claims::from_request_parts(parts, state).await;

        let claim: Option<&Claims> = parts.extensions.get();
        let claim = if let Some(claim) = claim {
            claim
        } else {
            &Claims::from_request_parts(parts, state).await?
        };

        let member = SpaceUser::get_by_key(
            &MemberKey::new(path.space_id, Uuid::parse_str(&claim.sub)?),
            db(),
        )
        .await
        .map_err(|err| match err {
            Error::NotFound => Error::unauthorized("You are not a member of this space"),
            _ => err,
        })?;
        let member = MemberExt::dataload_one(member, db()).await?;

        Ok(member.into())
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelPath {
    pub space_id: Option<Uuid>,
    pub channel_id: Uuid,
}

#[async_trait]
impl<S> FromRequestParts<S> for Load<Channel>
where
    S: Send + Sync,
{
    type Rejection = Error;
    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let path: Path<ChannelPath> =
            Path::from_request_parts(parts, state).await.map_err(|_| {
                Error::InternalServerError {
                    message: "channelId was not found".to_string(),
                }
            })?;
        let channel = Channel::find_by_id(path.channel_id, db()).await?;

        Ok(channel.into())
    }
}
