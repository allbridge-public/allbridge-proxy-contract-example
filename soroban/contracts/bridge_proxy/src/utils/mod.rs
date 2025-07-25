use crate::error::Error;

mod extend_ttl;

pub use extend_ttl::*;

#[inline]
pub fn safe_cast<T, K: TryFrom<T>>(from: T) -> Result<K, Error> {
    K::try_from(from).map_err(|_| Error::CastFailed)
}
