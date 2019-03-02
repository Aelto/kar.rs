#pragma once

namespace result {
  template <typename T, typename E = const char *>
  struct Result {
      union {
          T ok;
          E err;
      };

      bool is_error = false;

      Result<T, E> and(Result<T, E> and_value) {
        if (this->is_error) {
          return *this;
        }

        return and_value;
      }

      template<typename F>
      Result<T, E> and_then(F & fn) {
        if (is_error) {
          return Result(*this);
        }
        return fn(this->ok);
      };

      template<typename TT = T, typename F>
      Result<TT, E> map(F & fn) {
        if (is_error) {
          Result<TT, E> err;
          err.is_error = true;
          err.err = this->err;

          return err;
        }
        
        Result<TT, E> res;
        res.ok = fn(this->ok);

        return res;
      }

      Result<T, E> or(T or_value) {
        if (this->is_error) {
          Result<T, E> ok;
          ok.ok = or_value;
          return ok;
        }
        
        return *this;
      }

      template <typename F>
      Result<T, E> or_else(F & fn) {
        if (this->is_error) {
          return fn(this->err);
        }

        return *this;
      }

      T unwrap_or(T or_unwrapped_value) {
        // return this->or(or_unwrapped_value).ok;
        if (this->is_error) {
          return or_unwrapped_value;
        }

        return this->ok;
      }

      template <typename F>
      T unwrap_or_else(F & fn) {
        if (this->is_error) {
          return fn(this->err);
        }

        return this->ok;
      }

      Result() 
        : is_error(false), ok() {};

      Result(E & err)
        : is_error(true), err(err) {};

      Result(Result<T, E> & result)
        : is_error(result.is_error) {
        if (this->is_error) {
          err = result.err;
        }
        else {
          ok = result.ok;
        }
      };

      ~Result() {
        if (is_error) {
          err.~E();
        }
        else {
          ok.~T();
        }
      }
  };

  template <typename E = const char *, typename T>
  Result<T, E> Ok(T ok_value) {
    Result<T, E> r;
    r.ok = ok_value;

    return r;
  }

  template <typename T, typename E>
  Result<T, E> Err(E & err_value) {
    return Result<T, E>(err_value);
  }
};

#ifndef no_result_macros_syntax
#define one_liner_lambda(action) [&](auto x) { return action; }
#define _or_else(action) or_else(one_liner_lambda(action))
#define _and_then(action) and_then(one_liner_lambda(action))
#define _map(type, action) map<type>(one_liner_lambda(action))
#define _unwrap_or_else(action) unwrap_or_else(one_liner_lambda(action))
#endif